import React from 'react';
import { Section, Text, Heading, Hr } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';
import { emailConfig } from '../../lib/email/config';

interface SubscriptionCanceledEmailProps {
  name: string;
  planName: string;
  endDate: string;
}

export const SubscriptionCanceledEmail: React.FC<SubscriptionCanceledEmailProps> = ({
  name,
  planName,
  endDate,
}) => {
  return (
    <BaseTemplate previewText={`Your BineAI ${planName} subscription has been canceled`}>
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#1e2a4a',
        }}
      >
        Subscription Canceled
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Hi {name},
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        We&apos;re sorry to see you go. Your BineAI {planName} subscription has been canceled as requested.
        You&apos;ll continue to have access to your premium features until {endDate}.
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '16px' }}>
        After that date, your account will be downgraded to the free tier with limited features.
        All of your conversations and data will remain safe and accessible.
      </Text>
      
      <Section
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e6ebf1',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '24px',
        }}
      >
        <Text
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#1e2a4a',
          }}
        >
          What happens next?
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          • You&apos;ll have full access to premium features until {endDate}
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          • After {endDate}, your account will be downgraded to the free tier
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          • Your data and conversation history will be preserved
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          • You can resubscribe at any time to regain access to premium features
        </Text>
      </Section>
      
      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button 
          href={`${emailConfig.baseUrl}/pricing`}
          variant="primary"
        >
          Resubscribe
        </Button>
      </Section>
      
      <Hr style={{ borderTop: '1px solid #e6ebf1', margin: '24px 0' }} />
      
      <Text style={{ fontSize: '14px', color: '#444', marginTop: '16px' }}>
        If you canceled by mistake or have any questions, please contact us at {emailConfig.replyTo} and we&apos;ll be happy to help.
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        Thank you for being part of the BineAI community. We hope to see you again soon!
      </Text>
    </BaseTemplate>
  );
};