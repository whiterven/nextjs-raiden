// components/email/base-template.tsx
import React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Img,
  Link,
  Hr,
  Row,
  Column,
  Font,
  Tailwind,
} from '@react-email/components';

interface BaseTemplateProps {
  previewText: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  showLogo?: boolean;
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  companyName?: string;
  companyAddress?: string;
  headerGradient?: boolean;
  theme?: 'light' | 'dark' | 'minimal';
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  previewText,
  children,
  footerContent,
  showLogo = true,
  logoUrl = `${baseUrl}/logo/bineai-logo.png`,
  logoAlt = "BineAI",
  logoWidth = 140,
  logoHeight = 120,
  companyName = "BineAI",
  companyAddress = "BineAI Inc., San Francisco, CA",
  headerGradient = true,
  theme = 'light',
}) => {
  const currentYear = new Date().getFullYear();

  // Theme-based color schemes
  const themes = {
    light: {
      background: '#ffffff',
      cardBackground: '#ffffff',
      text: '#1a1a1a',
      textSecondary: '#666666',
      textMuted: '#888888',
      border: '#e5e7eb',
      accent: '#000000',
      footerBg: '#f9fafb',
    },
    dark: {
      background: '#0f0f0f',
      cardBackground: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      border: '#374151',
      accent: '#ffffff',
      footerBg: '#111827',
    },
    minimal: {
      background: '#fefefe',
      cardBackground: '#ffffff',
      text: '#2d3748',
      textSecondary: '#4a5568',
      textMuted: '#718096',
      border: '#e2e8f0',
      accent: '#2b6cb0',
      footerBg: '#f7fafc',
    },
  };

  const colors = themes[theme];

  return (
    <Html>
      <Head>
        {/* Multiple font loading for better compatibility */}
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Fraunces"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              .dark-mode-bg { background-color: ${colors.background} !important; }
              .dark-mode-text { color: ${colors.text} !important; }
              .dark-mode-card { background-color: ${colors.cardBackground} !important; }
            }
            
            /* Responsive design */
            @media only screen and (max-width: 600px) {
              .mobile-padding { padding: 24px !important; }
              .mobile-text-center { text-align: center !important; }
              .mobile-full-width { width: 100% !important; }
              .mobile-stack { display: block !important; width: 100% !important; }
            }
            
            /* Enhanced link styles */
            a:hover { 
              opacity: 0.8 !important; 
              transform: translateY(-1px) !important;
              transition: all 0.2s ease !important;
            }
          `}
        </style>
      </Head>
      
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                'brand-primary': colors.accent,
                'brand-bg': colors.background,
                'brand-card': colors.cardBackground,
                'brand-text': colors.text,
                'brand-text-secondary': colors.textSecondary,
                'brand-text-muted': colors.textMuted,
                'brand-border': colors.border,
                'brand-footer': colors.footerBg,
              },
              fontFamily: {
                'display': ['Fraunces', 'Georgia', 'serif'],
                'body': ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
              },
              spacing: {
                '18': '18px',
                '22': '22px',
                '28': '28px',
                '36': '36px',
                '44': '44px',
                '52': '52px',
                '60': '60px',
              },
              borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
              },
              boxShadow: {
                'email': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'email-dark': '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              },
            },
          },
        }}
      >
        <Preview>{previewText}</Preview>
        
        <Body 
          className="font-body dark-mode-bg"
          style={{ 
            backgroundColor: colors.background,
            margin: '0',
            padding: '0',
            textSizeAdjust: '100%',
          }}
        >
          {/* Email wrapper with background */}
          <div style={{ 
            backgroundColor: colors.background, 
            minHeight: '100vh',
            padding: '40px 20px',
          }}>
            
            {/* Logo Section with enhanced styling */}
            {showLogo && (
              <Section className="text-center mb-8">
                <Container className="max-w-[600px]">
                  {headerGradient && (
                    <div 
                      style={{
                        background: theme === 'dark' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        height: '4px',
                        borderRadius: '2px',
                        marginBottom: '32px',
                      }}
                    />
                  )}
                  <Img
                    src={logoUrl}
                    width={logoWidth}
                    height={logoHeight}
                    alt={logoAlt}
                    style={{
                      display: 'block',
                      margin: '0 auto',
                      filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none',
                    }}
                  />
                </Container>
              </Section>
            )}

            {/* Main Content Container with enhanced design */}
            <Container 
              className="max-w-[600px] dark-mode-card mobile-full-width"
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                boxShadow: theme === 'dark' 
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
            >
              
              {/* Decorative top accent */}
              <div 
                style={{
                  height: '6px',
                  background: headerGradient 
                    ? (theme === 'dark' 
                        ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)')
                    : colors.accent,
                  borderRadius: '20px 20px 0 0',
                }}
              />
              
              {/* Main Content Area */}
              <Section 
                className="mobile-padding"
                style={{ 
                  padding: '48px 48px 48px 48px',
                  color: colors.text,
                  fontSize: '16px',
                  lineHeight: '1.7',
                }}
              >
                <div className="dark-mode-text">
                  {children}
                </div>
              </Section>

            </Container>

            {/* Enhanced Footer */}
            <Container 
              className="mt-10 max-w-[600px]"
              style={{
                backgroundColor: colors.footerBg,
                borderRadius: '16px',
                marginTop: '32px',
                padding: '32px 24px',
                border: `1px solid ${colors.border}`,
              }}
            >
              
              {/* Custom Footer Content */}
              {footerContent && (
                <Section className="mb-6">
                  <div style={{ color: colors.text }}>
                    {footerContent}
                  </div>
                </Section>
              )}

              {/* Social Links with improved styling */}
              <Section className="text-center mb-6">
                <Row>
                  <Column align="center">
                    <Link 
                      href="https://twitter.com/bineai" 
                      style={{
                        color: colors.text,
                        fontSize: '15px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        margin: '0 16px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${colors.border}`,
                        display: 'inline-block',
                      }}
                    >
                      Twitter
                    </Link>
                  </Column>
                  <Column align="center">
                    <Link 
                      href="https://linkedin.com/company/bineai" 
                      style={{
                        color: colors.text,
                        fontSize: '15px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        margin: '0 16px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${colors.border}`,
                        display: 'inline-block',
                      }}
                    >
                      LinkedIn
                    </Link>
                  </Column>
                  <Column align="center">
                    <Link 
                      href="https://github.com/bineai" 
                      style={{
                        color: colors.text,
                        fontSize: '15px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        margin: '0 16px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${colors.border}`,
                        display: 'inline-block',
                      }}
                    >
                      GitHub
                    </Link>
                  </Column>
                </Row>
              </Section>

              {/* Divider */}
              <Hr style={{ 
                border: 'none',
                borderTop: `1px solid ${colors.border}`,
                margin: '24px 0',
              }} />

              {/* Footer Links */}
              <Section className="text-center mb-4">
                <Row>
                  <Column className="mobile-stack text-center">
                    <Link 
                      href="https://bineai.com/unsubscribe" 
                      style={{
                        color: colors.textSecondary,
                        fontSize: '14px',
                        textDecoration: 'none',
                        margin: '0 12px',
                        fontWeight: '400',
                      }}
                    >
                      Unsubscribe
                    </Link>
                    <span style={{ color: colors.border, margin: '0 8px' }}>•</span>
                    <Link 
                      href="https://bineai.com/preferences" 
                      style={{
                        color: colors.textSecondary,
                        fontSize: '14px',
                        textDecoration: 'none',
                        margin: '0 12px',
                        fontWeight: '400',
                      }}
                    >
                      Preferences
                    </Link>
                  </Column>
                </Row>
              </Section>

              {/* Legal Links */}
              <Section className="text-center mb-4">
                <Text style={{ 
                  fontSize: '14px', 
                  color: colors.textMuted,
                  margin: '0',
                  lineHeight: '1.5',
                }}>
                  <Link 
                    href="https://bineai.com/privacy" 
                    style={{
                      color: colors.textMuted,
                      textDecoration: 'none',
                    }}
                  >
                    Privacy Policy
                  </Link>
                  <span style={{ margin: '0 8px' }}>•</span>
                  <Link 
                    href="https://bineai.com/terms" 
                    style={{
                      color: colors.textMuted,
                      textDecoration: 'none',
                    }}
                  >
                    Terms of Service
                  </Link>
                </Text>
              </Section>

              {/* Company Info */}
              <Text 
                className="text-center"
                style={{ 
                  color: colors.textMuted,
                  fontSize: '13px',
                  margin: '16px 0 0',
                  lineHeight: '1.6',
                  letterSpacing: '0.01em',
                }}
              >
                © {currentYear} {companyName}. All rights reserved.
                <br />
                {companyAddress}
              </Text>
            </Container>
          </div>
        </Body>
      </Tailwind>
    </Html>
  );
};