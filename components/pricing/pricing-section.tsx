import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const tiers = [
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
    buttonText: "Get Started",
    buttonVariant: "outline" as const
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
    buttonText: "Start Trial",
    buttonVariant: "default" as const,
    popular: true
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
    buttonText: "Contact Sales",
    buttonVariant: "default" as const
  }
];

export function PricingSection() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tiers.map((tier) => (
        <Card key={tier.name} className={
          tier.popular 
            ? "border-primary relative" 
            : ""
        }>
          {tier.popular && (
            <div className="absolute inset-x-0 bottom-0">
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
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
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
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{model}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={tier.buttonVariant}
            >
              {tier.buttonText}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 