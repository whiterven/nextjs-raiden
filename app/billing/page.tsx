'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for Stripe success/cancel query params
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');

    if (sessionId) {
      toast.success('Successfully upgraded your plan!');
      // Remove query params
      window.history.replaceState({}, '', '/billing');
    }
  }, []);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/billing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanDetails = () => {
    switch (session?.user?.type) {
      case 'regular':
        return {
          name: 'Regular (Free)',
          price: '$0/month',
          description: 'Basic access to AI chat features',
        };
      case 'advanced':
        return {
          name: 'Advanced',
          price: '$19/month',
          description: 'Enhanced features and increased limits',
        };
      case 'expert':
        return {
          name: 'Expert',
          price: '$41/month',
          description: 'Full access to all premium features',
        };
      default:
        return {
          name: 'No Plan',
          price: '-',
          description: 'No active subscription',
        };
    }
  };

  const plan = getPlanDetails();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-7xl">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-transparent hover:text-primary"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and billing details
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your current subscription plan and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-semibold">{plan.name}</div>
                <div className="text-lg text-muted-foreground">{plan.price}</div>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </CardContent>
            <CardFooter>
              {session?.user?.type !== 'regular' ? (
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 size-4" />
                      Manage Subscription
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade Plan
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 