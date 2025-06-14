import React from 'react';
import { Section, Text, Heading, Img } from '@react-email/components';
import { BaseTemplate } from '../email/base-template';
import { Button } from '../email/button';
import { emailConfig } from '../../lib/email/config';

interface FeatureAnnouncementEmailProps {
  name: string;
  featureName: string;
  featureDescription: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  additionalPoints?: string[];
}

export const FeatureAnnouncementEmail: React.FC<FeatureAnnouncementEmailProps> = ({
  name,
  featureName,
  featureDescription,
  imageUrl,
  ctaText = 'Try it now',
  ctaUrl = `${emailConfig.baseUrl}/chat/new`,
  additionalPoints = [],
}) => {
  return (
    <BaseTemplate previewText={`New on BineAI: ${featureName}`}>
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '0',
          color: '#1e2a4a',
        }}
      >
        New Feature Alert: {featureName}
      </Heading>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        Hi {name},
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        We&apos;re excited to announce that we&apos;ve just added {featureName} to BineAI, our universal AI chat platform that gives you access to multiple AI models in one place!
      </Text>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
        {featureDescription}
      </Text>
      
      {imageUrl && (
        <Section style={{ marginTop: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <Img
            src={imageUrl}
            alt={featureName}
            width="500"
            style={{ maxWidth: '100%', borderRadius: '6px' }}
          />
        </Section>
      )}
      
      {additionalPoints.length > 0 && (
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
            Key highlights:
          </Text>
          
          <Section style={{ marginLeft: '20px', color: '#444' }}>
            {additionalPoints.map((point, index) => (
              <Text key={index} style={{ margin: '8px 0' }}>
                • {point}
              </Text>
            ))}
          </Section>
        </>
      )}
      
      <Section style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button href={ctaUrl}>
          {ctaText}
        </Button>
      </Section>
      
      <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', marginTop: '24px' }}>
        At BineAI, we&apos;re constantly working to improve your experience and bring you the best unified AI chat platform possible. With one subscription, you get access to OpenAI, Claude, Grok, Gemini, DeepSeek and more - all in a single conversation thread. We&apos;d love to hear your feedback after you&apos;ve tried the new feature!
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