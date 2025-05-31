import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Minus } from "lucide-react";

const features = [
  {
    name: "Daily Message Limit",
    regular: "5/day",
    advanced: "Increased",
    expert: "Unlimited / High Cap"
  },
  {
    name: "AI Model Access",
    regular: "Basic",
    advanced: "Advanced Models",
    expert: "All Models"
  },
  {
    name: "Chat History",
    regular: "Basic",
    advanced: "Extended + Search",
    expert: "Full + Exportable"
  },
  {
    name: "Multi-Model Chat",
    regular: false,
    advanced: "Limited",
    expert: true
  },
  {
    name: "Custom AI Personas",
    regular: false,
    advanced: true,
    expert: "Yes + Save/Share"
  },
  {
    name: "Model Priority Queue",
    regular: "Low",
    advanced: "Medium",
    expert: "High"
  },
  {
    name: "Early Access to New Models",
    regular: false,
    advanced: true,
    expert: "First Access"
  },
  {
    name: "Conversation Summaries & Insights",
    regular: false,
    advanced: false,
    expert: true
  },
  {
    name: "API Access",
    regular: false,
    advanced: "Optional Add-on",
    expert: "Included"
  },
  {
    name: "Support",
    regular: "Community Only",
    advanced: "Email",
    expert: "Priority Support"
  }
];

export function PricingComparison() {
  return (
    <div className="mt-16 space-y-4">
      <h2 className="text-3xl font-bold text-center mb-8">📊 Compare Plans</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Feature</TableHead>
              <TableHead>Regular (Free)</TableHead>
              <TableHead>Advanced ($19/mo)</TableHead>
              <TableHead>Expert ($41/mo)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.name}>
                <TableCell className="font-medium">{feature.name}</TableCell>
                <TableCell>
                  {typeof feature.regular === 'boolean' ? (
                    feature.regular ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <Minus className="size-4 text-muted-foreground" />
                    )
                  ) : (
                    feature.regular
                  )}
                </TableCell>
                <TableCell>
                  {typeof feature.advanced === 'boolean' ? (
                    feature.advanced ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <Minus className="size-4 text-muted-foreground" />
                    )
                  ) : (
                    feature.advanced
                  )}
                </TableCell>
                <TableCell>
                  {typeof feature.expert === 'boolean' ? (
                    feature.expert ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <Minus className="size-4 text-muted-foreground" />
                    )
                  ) : (
                    feature.expert
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 