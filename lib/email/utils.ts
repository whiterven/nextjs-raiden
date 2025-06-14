// lib/email/utils.ts
import { nanoid } from 'nanoid';
import { sendEmail } from './send-email';
import { createEmailVerificationToken, createPasswordResetToken, getUser } from '../db/queries';
import type { WelcomeEmailProps, VerifyEmailProps, PasswordResetEmailProps } from './send-email';

/**
 * Generates a secure token for verification purposes
 * @returns A random token string
 */
export function generateToken(): string {
  return nanoid(32);
}

/**
 * Sends a verification email to a user
 * @param userId - User ID
 * @param email - User's email address
 * @param name - User's name
 * @param baseUrl - Base URL for the verification link
 */
export async function sendVerificationEmail(
  userId: string, 
  email: string, 
  name: string,
  baseUrl: string
) {
  try {
    // Generate token and set expiry (24 hours)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Save token to database
    await createEmailVerificationToken({
      userId,
      token,
      expiresAt,
    });
    
    // Create verification URL
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    
    // Send email with token
    const props: VerifyEmailProps = {
      name,
      verificationUrl,
      expiresIn: '24 hours',
    };
    
    return await sendEmail({
      to: email,
      type: 'verifyEmail',
      props,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending verification email',
    };
  }
}

/**
 * Sends a welcome email to a new user
 * @param email - User's email address
 * @param name - User's name
 */
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const props: WelcomeEmailProps = {
      name,
      email,
    };
    
    return await sendEmail({
      to: email,
      type: 'welcome',
      props,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending welcome email',
    };
  }
}

/**
 * Sends a password reset email to a user
 * @param email - User's email address
 * @param baseUrl - Base URL for the reset link
 */
export async function sendPasswordResetEmail(email: string, baseUrl: string) {
  try {
    // Find user by email
    const users = await getUser(email);
    
    if (users.length === 0) {
      // Don't reveal that the email doesn't exist, still return success
      return { success: true };
    }
    
    const user = users[0];
    
    // Generate token and set expiry (1 hour)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Save token to database
    await createPasswordResetToken({
      userId: user.id,
      token,
      expiresAt,
    });
    
    // Create reset URL
    const resetUrl = `${baseUrl}/api/auth/reset-password?token=${token}`;
    
    // Send email with token
    const props: PasswordResetEmailProps = {
      name: user.firstName || email.split('@')[0],
      resetUrl,
      expiresIn: '1 hour',
    };
    
    return await sendEmail({
      to: email,
      type: 'passwordReset',
      props,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending password reset email',
    };
  }
} 