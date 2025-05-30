'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check } from 'lucide-react';

export function BillingInfo() {
  // This would come from your database
  const subscription = {
    plan: 'advanced',
    status: 'active',
    nextBilling: '2024-05-01',
    amount: '$19.00',
    features: [
      'Increased daily message limit',
      'Access to broader model range',
      'Extended conversation history',
      'Custom AI personas',
      'Early access to new releases',
    ],
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </div>
          <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
            {subscription.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
            </p>
            <p className="text-sm text-muted-foreground">
              Next billing date: {new Date(subscription.nextBilling).toLocaleDateString()}
            </p>
          </div>
          <p className="text-2xl font-bold">{subscription.amount}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Plan Features</h4>
          <ul className="space-y-2">
            {subscription.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" variant="outline">
          <CreditCard className="mr-2 size-4" />
          Update Payment Method
        </Button>
        <Button className="w-full" variant="destructive">
          Cancel Subscription
        </Button>
      </CardFooter>
    </Card>
  );
} 