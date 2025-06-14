import React from 'react';
import { Section, Text, Heading, Hr } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';
import { emailConfig } from '../../lib/email/config';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiresIn?: string; // e.g., "1 hour"
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  name,
  resetUrl,
  expiresIn = '1 hour',
}) => {
  return (
    <BaseTemplate previewText="Reset your BineAI password">
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#1e2a4a',
        }}
      >
        Reset Your Password
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Hi {name},
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        We received a request to reset your BineAI password. BineAI is your unified platform for accessing OpenAI, Claude, Grok, Gemini, and more with a single subscription. Click the button below to choose a new password. This link is valid for {expiresIn}.
      </Text>
      
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button href={resetUrl}>
          Reset Your Password
        </Button>
      </Section>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>        If you didn&apos;t request a password reset, you can safely ignore this email. Your
        password will remain unchanged.
      </Text>
      
      <Hr style={{ borderTop: '1px solid #e6ebf1', margin: '24px 0' }} />
      
      <Text style={{ fontSize: '14px', color: '#666' }}>
        For security reasons, this password reset link will expire in {expiresIn}.
        If the button above doesn&apos;t work, copy and paste this URL into your browser:
      </Text>
      
      <Text
        style={{
          fontSize: '14px',
          color: '#556cd6',
          wordBreak: 'break-all',
          margin: '12px 0',
        }}
      >
        {resetUrl}
      </Text>
      
      <Text style={{ fontSize: '14px', color: '#444', marginTop: '24px' }}>
        If you did not request this email, please contact us immediately at {emailConfig.replyTo}.
      </Text>
    </BaseTemplate>
  );
}; 