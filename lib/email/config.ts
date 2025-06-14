import { Resend } from 'resend';

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@bineai.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@bineai.com',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://bineai.com',
};

// Email subjects
export const emailSubjects = {
  welcome: 'Welcome to BineAI - Your Ultimate AI Chat Experience Begins Now',
  verifyEmail: 'Verify your email for BineAI',
  passwordReset: 'Reset your BineAI password',
  subscriptionConfirmation: 'Your BineAI subscription is confirmed',
  subscriptionCanceled: 'Your BineAI subscription has been canceled',
  paymentFailed: 'Action required: BineAI payment failed',
  accountSecurityPasswordChanged: 'Your BineAI password has been changed',
  accountSecuritySuspiciousLogin: 'Suspicious login attempt detected on your BineAI account',
  accountSecurityNewDevice: 'New sign-in to your BineAI account',
}; 