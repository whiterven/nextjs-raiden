import { InvoiceIcon } from '@/components/icons';

export function BillingHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <InvoiceIcon size={24} />
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your subscription, view payment history, and monitor your usage.
      </p>
    </div>
  );
} 