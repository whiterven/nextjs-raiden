import { Metadata } from 'next';
import { BillingHeader } from '@/components/billing/billing-header';
import { BillingInfo } from '@/components/billing/billing-info';
import { PaymentHistory } from '@/components/billing/payment-history';
import { UsageStats } from '@/components/billing/usage-stats';

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage your billing information and view usage statistics.',
};

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
      <BillingHeader />
      <div className="grid gap-8 md:grid-cols-2">
        <BillingInfo />
        <UsageStats />
      </div>
      <PaymentHistory />
    </div>
  );
} 