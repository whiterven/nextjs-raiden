import React from 'react';
import { Section, Text, Heading, Hr } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';
import { emailConfig } from '../../lib/email/config';

interface AccountSecurityEmailProps {
  name: string;
  event: 'password_changed' | 'suspicious_login' | 'login_new_device';
  deviceInfo?: string;
  location?: string;
  time?: string;
}

export const AccountSecurityEmail: React.FC<AccountSecurityEmailProps> = ({
  name,
  event,
  deviceInfo,
  location,
  time,
}) => {
  // Get event-specific content
  const getEventContent = () => {
    switch (event) {
      case 'password_changed':
        return {
          title: 'Password Changed',
          previewText: 'Your BineAI password was changed',
          content: (
            <>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
                Your BineAI account password was recently changed. If you made this change, no further action is required.
              </Text>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '16px', fontWeight: '600' }}>
                If you did not change your password, your account might be compromised.
              </Text>
            </>
          ),
          actionText: 'Reset Your Password',
          actionUrl: `${emailConfig.baseUrl}/forgot-password`,
        };
      case 'suspicious_login':
        return {
          title: 'Suspicious Login Attempt',
          previewText: 'Suspicious login attempt detected on your BineAI account',
          content: (
            <>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
                We detected a suspicious login attempt on your BineAI account. 
              </Text>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '16px' }}>
                <strong>Device:</strong> {deviceInfo || 'Unknown device'}<br />
                <strong>Location:</strong> {location || 'Unknown location'}<br />
                <strong>Time:</strong> {time || 'Recent'}
              </Text>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '16px', fontWeight: '600' }}>
                If this wasn&apos;t you, please take immediate action to secure your account.
              </Text>
            </>
          ),
          actionText: 'Secure Your Account',
          actionUrl: `${emailConfig.baseUrl}/settings`,
        };
      case 'login_new_device':
        return {
          title: 'New Sign-In',
          previewText: 'New sign-in to your BineAI account',
          content: (
            <>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
                Your BineAI account was recently accessed from a new device.
              </Text>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '16px' }}>
                <strong>Device:</strong> {deviceInfo || 'Unknown device'}<br />
                <strong>Location:</strong> {location || 'Unknown location'}<br />
                <strong>Time:</strong> {time || 'Recent'}
              </Text>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '16px' }}>
                If this was you, no further action is required.
              </Text>
            </>
          ),
          actionText: 'Review Account Activity',
          actionUrl: `${emailConfig.baseUrl}/settings/security`,
        };
      default:
        return {
          title: 'Security Alert',
          previewText: 'Security alert for your BineAI account',
          content: (
            <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
              There was a security event related to your BineAI account. Please review your account for any suspicious activity.
            </Text>
          ),
          actionText: 'Review Account',
          actionUrl: `${emailConfig.baseUrl}/settings`,
        };
    }
  };

  const eventContent = getEventContent();

  return (
    <BaseTemplate previewText={eventContent.previewText}>
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#1e2a4a',
        }}
      >
        {eventContent.title}
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Hi {name},
      </Text>
      
      {eventContent.content}
      
      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button 
          href={eventContent.actionUrl}
          variant="primary"
        >
          {eventContent.actionText}
        </Button>
      </Section>
      
      <Hr style={{ borderTop: '1px solid #e6ebf1', margin: '24px 0' }} />
      
      <Text style={{ fontSize: '14px', color: '#444', marginTop: '16px' }}>                If you didn&apos;t perform this action or need help, please contact our support team at {emailConfig.replyTo}.
      </Text>

      <Text style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
        For security, this email was sent to the email address associated with your BineAI account.
      </Text>
      
      <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        Thank you for using BineAI.
      </Text>
    </BaseTemplate>
  );
};