import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { user, emailVerificationTokens } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { sendEmail } from '@/lib/email/send-email';
import { emailConfig } from '@/lib/email/config';
import { verifyEmailToken } from '@/lib/db/queries';

// Schema for validating request to send verification email
const SendVerificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Schema for validating token verification
const VerifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Handler for sending verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request
    const result = SendVerificationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { userId } = result.data;
    
    // Find the user
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));
      
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const foundUser = users[0];
    
    if (foundUser.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }
    
    // Generate a unique token
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24 hours
    
    // Delete any existing tokens for this user
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId));
    
    // Insert new token
    await db.insert(emailVerificationTokens).values({
      id: nanoid(),
      userId,
      token,
      expiresAt,
    });
    
    // Generate verification URL
    const verificationUrl = `${emailConfig.baseUrl}/api/auth/verify-email?token=${token}`;
    
    // Send verification email
    await sendEmail({
      to: foundUser.email,
      type: 'verifyEmail',
      props: {
        name: foundUser.firstName || foundUser.email.split('@')[0],
        verificationUrl,
        expiresIn: '24 hours',
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Handler for verifying token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request
    const result = VerifyTokenSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { token } = result.data;
    
    // Find the token
    const tokens = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token));
      
    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    const verificationToken = tokens[0];
    
    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, verificationToken.id));
      
      return NextResponse.json(
        { error: 'Token has expired, please request a new one' },
        { status: 400 }
      );
    }
    
    // Update user as verified
    await db
      .update(user)
      .set({ emailVerified: new Date() })
      .where(eq(user.id, verificationToken.userId));
    
    // Delete the used token
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, verificationToken.id));
    
    // Get the user
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, verificationToken.userId));
    
    // Send welcome email
    if (users.length > 0) {
      const foundUser = users[0];
      await sendEmail({
        to: foundUser.email,
        type: 'welcome',
        props: {
          name: foundUser.firstName || foundUser.email.split('@')[0],
          email: foundUser.email,
        },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from query params
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
    }
    
    // Verify the token
    const result = await verifyEmailToken({ token });
    
    if (!result.success) {
      return NextResponse.redirect(new URL(`/login?error=${result.message}`, request.url));
    }
    
    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
  }
} 