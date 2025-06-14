import React from 'react';
import { Section, Text, Heading, Hr } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';

interface VerifyEmailProps {
  name: string;
  verificationUrl: string;
  expiresIn?: string; // e.g., "24 hours"
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  name,
  verificationUrl,
  expiresIn = '24 hours',
}) => {
  return (
    <BaseTemplate previewText="Please verify your email address for BineAI">
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#1e2a4a',
        }}
      >
        Verify your email address
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Hi {name},
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Thanks for signing up for BineAI! We&apos;re revolutionizing the way people interact with AI by providing a unified platform where you can chat with multiple AI models (OpenAI, Claude, Grok, Gemini, and more) in a single conversation. Please verify your email address to unlock full access to our platform.
      </Text>
      
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button href={verificationUrl}>
          Verify Email Address
        </Button>
      </Section>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        This verification link will expire in {expiresIn}.
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        If you didn&apos;t sign up for BineAI, you can safely ignore this email.
      </Text>
      
      <Hr style={{ borderTop: '1px solid #e6ebf1', margin: '24px 0' }} />
      
      <Text style={{ fontSize: '14px', color: '#666' }}>
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
        {verificationUrl}
      </Text>
    </BaseTemplate>
  );
};