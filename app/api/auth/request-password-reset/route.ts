import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email/utils';

const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = passwordResetSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Get base URL for reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Send the password reset email
    const emailResult = await sendPasswordResetEmail(email, baseUrl);
    
    // Always return success, even if user doesn't exist (for security)
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in password reset request:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
} 