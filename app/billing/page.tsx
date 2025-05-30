import { Metadata } from 'next';
import { BillingHeader } from '@/components/billing/billing-header';
import { BillingInfo } from '@/components/billing/billing-info';
import { PaymentHistory } from '@/components/billing/payment-history';
import { UsageStats } from '@/components/billing/usage-stats';
import { auth } from '@/app/(auth)/auth';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Billing bineAi',
  description: 'Manage your billing information and view payment history',
};

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p>Please sign in to view your billing information.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6">
        {/* Back Button */}
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ChevronLeft className="size-4" />
              Back to Chat
            </Link>
          </Button>
        </div>

        {/* Header */}
        <BillingHeader />

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="grid gap-6">
            <BillingInfo userType={session.user.type} />
            <UsageStats userId={session.user.id} />
          </div>

          {/* Right Column */}
          <div className="grid gap-6">
            <PaymentHistory />
          </div>
        </div>
      </div>
    </div>
  );
} 