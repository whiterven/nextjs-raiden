import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type PlanType = "regular" | "advanced" | "expert";

interface PricingTier {
  name: string;
  emoji: string;
  price: string;
  billing: string;
  description: string;
  features: string[];
  models: string[];
  buttonText: string;
  buttonVariant: "outline" | "default";
  type: PlanType;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Regular",
    emoji: "🟢",
    price: "$0",
    billing: "/month",
    description: "For casual users and AI explorers.",
    features: [
      "5 free messages per day",
      "Access to select open-source models",
      "Simple, clean chat interface",
      "Basic chat history",
      "Light & dark theme support"
    ],
    models: [
      "Grok 2",
      "DeepSeek 70B",
      "Other lightweight models"
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline",
    type: "regular"
  },
  {
    name: "Advanced",
    emoji: "🟡",
    price: "$19",
    billing: "/month",
    description: "For creators, developers, and enthusiasts who want more power.",
    features: [
      "Increased daily message limit",
      "Access to broader model range",
      "Extended conversation history",
      "Custom AI personas",
      "Early access to new releases",
      "Priority model response"
    ],
    models: [
      "LLaMA 4 Scout",
      "Gemini 2.0 Flash",
      "Claude 3.5/3.7 Sonnet",
      "Grok 3 Mini",
      "GPT-01, GPT-03, GPT-4.1",
      "And more..."
    ],
    buttonText: "Upgrade to Advanced",
    buttonVariant: "default",
    popular: true,
    type: "advanced"
  },
  {
    name: "Expert",
    emoji: "🔴",
    price: "$41",
    billing: "/month",
    description: "Full access. Maximum power. For professionals and power users.",
    features: [
      "Unlimited messages",
      "Full model library access",
      "Multi-model chat threads",
      "Premium models access",
      "Chat insights & summaries",
      "API access included",
      "Priority support"
    ],
    models: [
      "Claude 4 Sonnet & Opus",
      "Gemini 2.5 Pro",
      "GPT-o4 & top OpenAI models",
      "All future premium releases",
      "Full provider coverage"
    ],
    buttonText: "Upgrade to Expert",
    buttonVariant: "default",
    type: "expert"
  }
];

export function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanType | null>(null);

  const handleUpgrade = async (planType: Extract<PlanType, "advanced" | "expert">) => {
    if (!session?.user) {
      toast.error("Please sign in to upgrade your plan");
      router.push("/login");
      return;
    }

    try {
      setLoading(planType);
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
          returnUrl: `${window.location.origin}/billing`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start upgrade process. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planType: PlanType) => {
    return session?.user?.type === planType;
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tiers.map((tier) => {
        const isCurrentUserPlan = isCurrentPlan(tier.type);
        
        return (
          <Card key={tier.name} className={
            tier.popular 
              ? "border-primary relative" 
              : ""
          }>
            {tier.popular && (
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                Most Popular
              </div>
            )}
            
            <CardHeader>
              <div className="text-2xl font-bold mb-2">{tier.emoji} {tier.name}</div>
              <div className="flex items-baseline text-2xl font-semibold">
                {tier.price}
                <span className="text-muted-foreground font-normal text-base">
                  {tier.billing}
                </span>
              </div>
              <CardDescription className="mt-2">{tier.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium">Features</div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Models Available</div>
                <ul className="space-y-2">
                  {tier.models.map((model) => (
                    <li key={model} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0" />
                      <span className="text-sm text-muted-foreground">{model}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full relative" 
                variant={tier.buttonVariant}
                disabled={isCurrentUserPlan || loading === tier.type}
                onClick={() => tier.type !== "regular" && handleUpgrade(tier.type as "advanced" | "expert")}
              >
                {loading === tier.type ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentUserPlan ? (
                  "Current Plan"
                ) : (
                  tier.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 