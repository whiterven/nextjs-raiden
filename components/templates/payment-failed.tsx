import React from 'react';
import { Section, Text, Heading } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';
import { emailConfig } from '../../lib/email/config';

interface PaymentFailedEmailProps {
  name: string;
  planName: string;
  amount: string;
  nextAttemptDate?: string;
  cardLastFour?: string;
}

export const PaymentFailedEmail: React.FC<PaymentFailedEmailProps> = ({
  name,
  planName,
  amount,
  nextAttemptDate,
  cardLastFour,
}) => {
  return (
    <BaseTemplate previewText="Action required: Payment failed for your BineAI subscription">
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#e11d48', // red for attention
        }}
      >
        Payment Failed
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Hi {name},
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        We were unable to process your payment of {amount} for your BineAI {planName} subscription.
        {cardLastFour && ` The charge to your card ending in ${cardLastFour} was declined.`}
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Your BineAI subscription gives you access to all major AI models including GPT-4, Claude, Grok, Gemini, and more - all through one seamless platform. We want to ensure you continue enjoying these benefits without interruption.
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        This could be due to:
      </Text>
      
      <Section style={{ marginLeft: '20px', color: '#444' }}>
        <Text style={{ margin: '8px 0' }}>
          • Insufficient funds in your account
        </Text>
        <Text style={{ margin: '8px 0' }}>
          • An expired or canceled credit card
        </Text>
        <Text style={{ margin: '8px 0' }}>
          • The card issuer declined the transaction
        </Text>
        <Text style={{ margin: '8px 0' }}>
          • Incorrect billing information
        </Text>
      </Section>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        {nextAttemptDate 
          ? `        We'll automatically attempt to charge your card again on ${nextAttemptDate}.`
          : 'Please update your payment information to continue your subscription without interruption.'
        }
      </Text>
      
      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button
          href={`${emailConfig.baseUrl}/billing`}
          variant="primary"
        >
          Update Payment Method
        </Button>
      </Section>
      
      <Text
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#444',
          marginTop: '24px',
          fontWeight: '600',
        }}
      >
        What happens next?
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>        If we&apos;re unable to collect payment after additional attempts, your subscription will be
        paused, and you&apos;ll lose access to premium features. Your data will remain safe, and you
        can reactivate your subscription at any time.
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        If you have any questions or need assistance, please reply to this email or contact
        our support team at {emailConfig.replyTo}.
      </Text>
      
             <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
         Thank you for your continued support!
       </Text>
     </BaseTemplate>
   );
}; 