// components/email/button.tsx
import React from 'react';
import { Button as EmailButton } from '@react-email/components';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  theme?: 'light' | 'dark';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  theme = 'light',
  icon,
  iconPosition = 'left',
}) => {
  const baseStyles = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : 'auto',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    lineHeight: '1.2',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    WebkitBoxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    MozBoxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const sizeStyles = {
    sm: { 
      fontSize: '14px', 
      padding: '10px 20px',
      borderRadius: '8px',
    },
    md: { 
      fontSize: '16px', 
      padding: '14px 28px',
      borderRadius: '10px',
    },
    lg: { 
      fontSize: '18px', 
      padding: '16px 32px',
      borderRadius: '12px',
    },
    xl: { 
      fontSize: '20px', 
      padding: '20px 40px',
      borderRadius: '14px',
    },
  };

  const lightVariants = {
    primary: {
      backgroundColor: '#000000',
      color: '#ffffff',
      border: '2px solid #000000',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    secondary: {
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '2px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#000000',
      border: '2px solid #000000',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    },
    ghost: {
      backgroundColor: '#f9fafb',
      color: '#374151',
      border: '2px solid transparent',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    },
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      border: '2px solid transparent',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
    },
    minimal: {
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      borderRadius: '6px',
    },
  };

  const darkVariants = {
    primary: {
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '2px solid #ffffff',
      boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
    },
    secondary: {
      backgroundColor: '#374151',
      color: '#ffffff',
      border: '2px solid #4b5563',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '2px solid #ffffff',
      boxShadow: '0 2px 6px rgba(255, 255, 255, 0.1)',
    },
    ghost: {
      backgroundColor: '#1f2937',
      color: '#d1d5db',
      border: '2px solid transparent',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
    },
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      border: '2px solid transparent',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
    minimal: {
      backgroundColor: '#374151',
      color: '#f9fafb',
      border: '1px solid #4b5563',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
      borderRadius: '6px',
    },
  };

  const variantStyles = theme === 'dark' ? darkVariants[variant] : lightVariants[variant];

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles,
  };

  // Handle icon positioning
  const buttonContent = icon ? (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      {iconPosition === 'left' && icon}
      <span>{children}</span>
      {iconPosition === 'right' && icon}
    </span>
  ) : children;

  return (
    <EmailButton 
      href={href} 
      style={combinedStyles}
      onMouseOver={(e) => {
        // Enhanced hover effects for better email client support
        const target = e.target as HTMLElement;
        target.style.transform = 'translateY(-1px)';
        target.style.opacity = '0.9';
      }}
      onMouseOut={(e) => {
        const target = e.target as HTMLElement;
        target.style.transform = 'translateY(0)';
        target.style.opacity = '1';
      }}
    >
      {buttonContent}
    </EmailButton>
  );
};

// Preset button components for common use cases
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const GradientButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="gradient" />
);

export const MinimalButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="minimal" />
);

// Usage examples:
/*
// Basic usage
<Button href="https://example.com">Click me</Button>

// With different variants
<PrimaryButton href="https://example.com">Primary Action</PrimaryButton>
<GradientButton href="https://example.com" size="lg">Get Started</GradientButton>

// Full width with icon
<Button 
  href="https://example.com" 
  variant="primary" 
  fullWidth 
  icon={<span>→</span>}
  iconPosition="right"
>
  Continue to Dashboard
</Button>

// Dark theme
<Button 
  href="https://example.com" 
  variant="outline" 
  theme="dark"
  size="lg"
>
  Learn More
</Button>
*/