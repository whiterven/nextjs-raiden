import React from 'react';
import { Section, Text, Heading } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';
import { emailConfig } from '../../lib/email/config';

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name, email }) => {
  return (
    <BaseTemplate previewText={`Welcome to BineAI, ${name}!`}>
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#1e2a4a',
        }}
      >
        Welcome to BineAI, {name}!
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Thank you for joining BineAI, the ultimate multi-model AI chat platform that&apos;s revolutionizing how people interact with AI. With BineAI, you can access OpenAI, Claude, Grok, Gemini, DeepSeek and more through a single unified interface with just one subscription. We&apos;re excited to have you on board!
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        With BineAI, you can:
      </Text>
      
      <Section style={{ marginLeft: '20px', color: '#444' }}>
        <Text style={{ margin: '8px 0' }}>
          • Chat with multiple AI models in one place (OpenAI, Claude, Grok, Gemini, and more)
        </Text>
        <Text style={{ margin: '8px 0' }}>
          • Compare AI responses side by side
        </Text>
        <Text style={{ margin: '8px 0' }}>
          • Share your conversations with others
        </Text>
        <Text style={{ margin: '8px 0' }}>
          • Access advanced features with a single subscription
        </Text>
      </Section>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        Ready to start? Click the button below to begin your AI conversation journey.
      </Text>
      
      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button href={`${emailConfig.baseUrl}/chat/new`}>
          Start Chatting Now
        </Button>
      </Section>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        If you have any questions or need assistance, feel free to reply to this email
        or contact our support team at {emailConfig.replyTo}.
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Happy chatting!
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        The BineAI Team
      </Text>
    </BaseTemplate>
  );
}; 