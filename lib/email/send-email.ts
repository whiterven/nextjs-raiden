//lib/email/send-email.ts
import { renderAsync } from '@react-email/render';
import { resend, emailConfig, emailSubjects } from './config';
import { WelcomeEmail } from '../../components/templates/welcome';
import { VerifyEmail } from '../../components/templates/verify-email';
import { PasswordResetEmail } from '../../components/templates/password-reset';
import { SubscriptionConfirmationEmail } from '../../components/templates/subscription-confirmation';
import { SubscriptionCanceledEmail } from '../../components/templates/subscription-canceled';
import { PaymentFailedEmail } from '../../components/templates/payment-failed';
import { FeatureAnnouncementEmail } from '../../components/templates/feature-announcement';
import { AccountSecurityEmail } from '../../components/templates/account-security';
import { createElement } from 'react';

// Define the specific prop types for each email template
export interface WelcomeEmailProps {
  name: string;
  email: string;
}

export interface VerifyEmailProps {
  name: string;
  verificationUrl: string;
  expiresIn?: string;
}

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiresIn?: string;
}

export interface SubscriptionConfirmationEmailProps {
  name: string;
  planName: string;
  amount: string;
  billingCycle: string;
  startDate: string;
  nextBillingDate: string;
  features?: string[];
}

export interface SubscriptionCanceledEmailProps {
  name: string;
  planName: string;
  endDate: string;
}

export interface PaymentFailedEmailProps {
  name: string;
  planName: string;
  amount: string;
  nextAttemptDate?: string;
  cardLastFour?: string;
}

export interface FeatureAnnouncementEmailProps {
  name: string;
  featureName: string;
  featureDescription: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  additionalPoints?: string[];
}

export interface AccountSecurityEmailProps {
  name: string;
  event: 'password_changed' | 'suspicious_login' | 'login_new_device';
  deviceInfo?: string;
  location?: string;
  time?: string;
}

type EmailType = 
  | 'welcome'
  | 'verifyEmail'
  | 'passwordReset'
  | 'subscriptionConfirmation'
  | 'subscriptionCanceled'
  | 'paymentFailed'
  | 'featureAnnouncement'
  | 'accountSecurity';

// Map email types to their corresponding prop types
interface EmailPropsMap {
  welcome: WelcomeEmailProps;
  verifyEmail: VerifyEmailProps;
  passwordReset: PasswordResetEmailProps;
  subscriptionConfirmation: SubscriptionConfirmationEmailProps;
  subscriptionCanceled: SubscriptionCanceledEmailProps;
  paymentFailed: PaymentFailedEmailProps;
  featureAnnouncement: FeatureAnnouncementEmailProps;
  accountSecurity: AccountSecurityEmailProps;
}

interface SendEmailOptions<T extends EmailType> {
  to: string;
  subject?: string;
  from?: string;
  replyTo?: string;
  type: T;
  props: EmailPropsMap[T];
}

export async function sendEmail<T extends EmailType>({
  to,
  subject,
  from = emailConfig.from,
  replyTo = emailConfig.replyTo,
  type,
  props,
}: SendEmailOptions<T>) {
  try {
    // Get the appropriate email component based on type
    let html = '';
    let defaultSubject = '';

    // Use createElement instead of JSX syntax
    switch (type) {
      case 'welcome': {
        const element = createElement(WelcomeEmail, props as WelcomeEmailProps);
        html = await renderAsync(element);
        defaultSubject = emailSubjects.welcome;
        break;
      }
      case 'verifyEmail': {
        const element = createElement(VerifyEmail, props as VerifyEmailProps);
        html = await renderAsync(element);
        defaultSubject = emailSubjects.verifyEmail;
        break;
      }
      case 'passwordReset': {
        const element = createElement(PasswordResetEmail, props as PasswordResetEmailProps);
        html = await renderAsync(element);
        defaultSubject = emailSubjects.passwordReset;
        break;
      }
      case 'subscriptionConfirmation': {
        const element = createElement(SubscriptionConfirmationEmail, props as SubscriptionConfirmationEmailProps);
        html = await renderAsync(element);
        defaultSubject = emailSubjects.subscriptionConfirmation;
        break;
      }
      case 'subscriptionCanceled': {
        const element = createElement(SubscriptionCanceledEmail, props as SubscriptionCanceledEmailProps);
        html = await renderAsync(element);
        defaultSubject = emailSubjects.subscriptionCanceled;
        break;
      }
      case 'paymentFailed': {
        const element = createElement(PaymentFailedEmail, props as PaymentFailedEmailProps);
        html = await renderAsync(element);
        defaultSubject = emailSubjects.paymentFailed;
        break;
      }
      case 'featureAnnouncement': {
        const element = createElement(FeatureAnnouncementEmail, props as FeatureAnnouncementEmailProps);
        html = await renderAsync(element);
        defaultSubject = `New on BineAI: ${(props as FeatureAnnouncementEmailProps).featureName}`;
        break;
      }
      case 'accountSecurity': {
        const securityProps = props as AccountSecurityEmailProps;
        const element = createElement(AccountSecurityEmail, securityProps);
        html = await renderAsync(element);
        
        // Select appropriate subject based on event type
        switch (securityProps.event) {
          case 'password_changed':
            defaultSubject = emailSubjects.accountSecurityPasswordChanged;
            break;
          case 'suspicious_login':
            defaultSubject = emailSubjects.accountSecuritySuspiciousLogin;
            break;
          case 'login_new_device':
            defaultSubject = emailSubjects.accountSecurityNewDevice;
            break;
          default:
            defaultSubject = 'Security Alert: BineAI Account';
        }
        break;
      }
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send the email using Resend
    const result = await resend.emails.send({
      from,
      to,
      subject: subject || defaultSubject,
      html,
      replyTo,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
} 