import { PricingSection } from '@/components/pricing/pricing-section';
import { PricingHeader } from '@/components/pricing/pricing-header';
import { PricingComparison } from '@/components/pricing/pricing-comparison';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <PricingHeader />
      <PricingSection />
      <PricingComparison />
    </div>
  );
} 