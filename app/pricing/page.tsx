'use client';

import { useRouter } from 'next/navigation';
import { PricingSection } from '@/components/pricing/pricing-section';
import { PricingHeader } from '@/components/pricing/pricing-header';
import { PricingComparison } from '@/components/pricing/pricing-comparison';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();

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
        <div className="space-y-8 sm:space-y-12">
          <PricingHeader />
          <PricingSection />
          <PricingComparison />
        </div>
      </div>
    </div>
  );
} 