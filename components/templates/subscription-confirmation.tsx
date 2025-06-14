import React from 'react';
import { Section, Text, Heading, Hr } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';
import { emailConfig } from '../../lib/email/config';

interface SubscriptionConfirmationEmailProps {
  name: string;
  planName: string;
  amount: string;
  billingCycle: string;
  startDate: string;
  nextBillingDate: string;
  features?: string[];
}

export const SubscriptionConfirmationEmail: React.FC<SubscriptionConfirmationEmailProps> = ({
  name,
  planName,
  amount,
  billingCycle,
  startDate,
  nextBillingDate,
  features = [],
}) => {
  return (
    <BaseTemplate previewText={`Your ${planName} subscription is confirmed`}>
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#1e2a4a',
        }}
      >
        Subscription Confirmed
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Hi {name},
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Thank you for subscribing to BineAI {planName}. Your subscription is now active! You&apos;ve just unlocked access to the ultimate multi-model AI chat platform that brings together OpenAI, Claude, Grok, Gemini, DeepSeek and more - all under one subscription.
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
          Subscription Details
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          <strong>Plan:</strong> {planName}
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          <strong>Amount:</strong> {amount}
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          <strong>Billing Cycle:</strong> {billingCycle}
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          <strong>Start Date:</strong> {startDate}
        </Text>
        
        <Text style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
          <strong>Next Billing Date:</strong> {nextBillingDate}
        </Text>
      </Section>
      
      {features.length > 0 && (
        <>
          <Text
            style={{
              fontSize: '16px',
              fontWeight: '600',
              lineHeight: '1.6',
              color: '#444',
              marginTop: '24px',
            }}
          >
            Your subscription includes:
          </Text>
          
          <Section style={{ marginLeft: '20px', color: '#444' }}>
            {features.map((feature, index) => (
              <Text key={index} style={{ margin: '8px 0' }}>
                • {feature}
              </Text>
            ))}
          </Section>
        </>
      )}
      
      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button href={`${emailConfig.baseUrl}/billing`} variant="primary">
          Manage Your Subscription
        </Button>
      </Section>
      
      <Hr style={{ borderTop: '1px solid #e6ebf1', margin: '24px 0' }} />
      
      <Text style={{ fontSize: '14px', color: '#444' }}>
        You can manage your subscription, update your payment method, or view your billing
        history in your <a href={`${emailConfig.baseUrl}/settings/billing`} style={{ color: '#556cd6', textDecoration: 'underline' }}>account settings</a>.
      </Text>
      
      <Text style={{ fontSize: '14px', color: '#444', marginTop: '16px' }}>
        If you have any questions or need assistance, please contact us at {emailConfig.replyTo}.
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        Thank you for choosing BineAI - where you can enjoy seamless conversations with multiple AI models in one place. One platform, endless possibilities!
      </Text>
    </BaseTemplate>
  );
};