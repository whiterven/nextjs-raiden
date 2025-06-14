import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email/utils';
import { resetPassword } from '@/lib/db/queries';

// Schema for validating request
const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

// Handler for initiating password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a reset password request or actual password reset
    const hasToken = 'token' in body && 'newPassword' in body;
    
    if (hasToken) {
      // Handle password reset with token
      const resetResult = resetPasswordSchema.safeParse(body);
      
      if (!resetResult.success) {
        const errorMessage = resetResult.error.issues[0]?.message || 'Invalid input';
        return NextResponse.json(
          { success: false, message: errorMessage },
          { status: 400 }
        );
      }
      
      const { token, newPassword } = resetResult.data;
      
      // Reset the password
      const result = await resetPassword({
        token,
        newPassword,
      });
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.message || 'Failed to reset password' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset successfully' 
      });
    } else {
      // Handle password reset request
      const requestResult = requestResetSchema.safeParse(body);
      
      if (!requestResult.success) {
        return NextResponse.json(
          { success: false, message: 'Invalid email address' },
          { status: 400 }
        );
      }
      
      const { email } = requestResult.data;
      
      // Get base URL for reset link
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      // Send the password reset email
      await sendPasswordResetEmail(email, baseUrl);
      
      // Always return success, even if user doesn't exist (for security)
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
} 