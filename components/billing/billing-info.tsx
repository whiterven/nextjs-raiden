'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check } from 'lucide-react';
import type { UserType } from '@/app/(auth)/auth';

interface BillingInfoProps {
  userType: UserType;
}

export function BillingInfo({ userType }: BillingInfoProps) {
  // Get pricing info based on user type
  const getPlanInfo = (type: UserType) => {
    switch (type) {
      case 'guest':
      case 'regular':
        return {
          price: '$0',
          features: [
            '5 free messages per day',
            'Access to select open-source models',
            'Simple, clean chat interface',
            'Basic chat history',
            'Light & dark theme support'
          ],
          models: [
            'Grok 2',
            'DeepSeek 70B',
            'Other lightweight models'
          ]
        };
      case 'advanced':
        return {
          price: '$19',
          features: [
            'Increased daily message limit',
            'Access to broader model range',
            'Extended conversation history',
            'Custom AI personas',
            'Early access to new releases',
            'Priority model response'
          ],
          models: [
            'LLaMA 4 Scout',
            'Gemini 2.0 Flash',
            'Claude 3.5/3.7 Sonnet',
            'GPT-01, GPT-03, GPT-4.1'
          ]
        };
      case 'expert':
        return {
          price: '$41',
          features: [
            'Unlimited messages',
            'Full model library access',
            'Multi-model chat threads',
            'Premium models access',
            'Chat insights & summaries',
            'API access included',
            'Priority support'
          ],
          models: [
            'Claude 4 Sonnet & Opus',
            'Gemini 2.5 Pro',
            'GPT-o4 & top OpenAI models',
            'All future premium releases'
          ]
        };
    }
  };

  const planInfo = getPlanInfo(userType);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </div>
          <Badge variant="default">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {userType.charAt(0).toUpperCase() + userType.slice(1)} Plan
            </p>
            <p className="text-sm text-muted-foreground">
              {userType === 'guest' || userType === 'regular' 
                ? 'Free tier - No billing' 
                : `Next billing: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
              }
            </p>
          </div>
          <p className="text-2xl font-bold">
            {planInfo.price}
            {userType !== 'guest' && userType !== 'regular' && (
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            )}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Features</h4>
            <ul className="space-y-2">
              {planInfo.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Models</h4>
            <ul className="space-y-2">
              {planInfo.models.map((model) => (
                <li key={model} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-4 text-primary" />
                  {model}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" variant="outline" asChild>
          <a href="/pricing">
            {userType === 'guest' || userType === 'regular' ? 'Upgrade Plan' : 'Change Plan'}
          </a>
        </Button>
        {userType !== 'guest' && userType !== 'regular' && (
          <Button className="w-full" variant="destructive">
            Cancel Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 