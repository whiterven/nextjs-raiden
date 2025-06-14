'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Templates available for preview
const TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to users after they verify their email address',
  },
  {
    id: 'verify-email',
    name: 'Email Verification',
    description: 'Sent to users to verify their email address',
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Sent to users when they request a password reset',
  },
  {
    id: 'subscription-confirmation',
    name: 'Subscription Confirmation',
    description: 'Sent after a successful subscription purchase',
  },
  {
    id: 'payment-failed',
    name: 'Payment Failed',
    description: 'Sent when a subscription payment fails',
  },
  {
    id: 'feature-announcement',
    name: 'Feature Announcement',
    description: 'Sent to announce new features or AI models',
  },
];

export default function EmailPreviewPage() {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0].id);
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email Template Preview</h1>
      <p className="text-muted-foreground mb-8">
        View and test email templates in development mode.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>Select a template to preview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                      activeTemplate === template.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setActiveTemplate(template.id)}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => {
                  const win = window.open(
                    `/api/email/preview?template=${activeTemplate}`,
                    '_blank'
                  );
                  if (win) win.focus();
                }}
              >
                Open in New Tab
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {TEMPLATES.find((t) => t.id === activeTemplate)?.name || 'Preview'}
              </CardTitle>
              <CardDescription>
                {TEMPLATES.find((t) => t.id === activeTemplate)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] relative">
              <iframe
                src={`/api/email/preview?template=${activeTemplate}`}
                className="w-full h-full border-0 rounded-md"
                title="Email Preview"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 