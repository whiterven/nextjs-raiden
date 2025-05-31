import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Privacy Policy | BineAI",
  description: "Privacy Policy for BineAI - Your Universal AI Chat Platform",
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="space-y-8">
                <Section title="Introduction">
                  <p>
                    BineAI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our unified AI chat platform.
                  </p>
                </Section>

                <Section title="Information We Collect">
                  <SubSection title="Account Information">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Name and email address</li>
                      <li>Profile information and preferences</li>
                      <li>Authentication credentials</li>
                      <li>Payment information (processed securely via Stripe)</li>
                    </ul>
                  </SubSection>

                  <SubSection title="Chat Data">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Conversation history with AI models</li>
                      <li>Model preferences and settings</li>
                      <li>Usage patterns and interactions</li>
                      <li>Custom AI persona configurations</li>
                    </ul>
                  </SubSection>

                  <SubSection title="Technical Data">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>IP address and device information</li>
                      <li>Browser type and settings</li>
                      <li>Operating system information</li>
                      <li>Performance and error data</li>
                    </ul>
                  </SubSection>
                </Section>

                <Section title="How We Use Your Information">
                  <SubSection title="Core Services">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Providing access to AI models</li>
                      <li>Processing and maintaining conversations</li>
                      <li>Managing your subscription</li>
                      <li>Authenticating your identity</li>
                    </ul>
                  </SubSection>

                  <SubSection title="Platform Improvement">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Analyzing usage patterns</li>
                      <li>Improving model interactions</li>
                      <li>Developing new features</li>
                      <li>Enhancing user experience</li>
                    </ul>
                  </SubSection>
                </Section>

                <Section title="Data Security">
                  <p>
                    We implement robust security measures to protect your data:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>End-to-end encryption for all communications</li>
                    <li>Regular security audits and testing</li>
                    <li>Secure data centers with redundancy</li>
                    <li>Multi-factor authentication options</li>
                  </ul>
                </Section>

                <Section title="AI Model Providers">
                  <p>
                    We partner with leading AI providers (OpenAI, Anthropic, Google, etc.) and share only the necessary conversation data for model interactions. All providers are bound by strict data protection agreements.
                  </p>
                </Section>

                <Section title="Your Rights">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal data</li>
                    <li>Export your conversation history</li>
                    <li>Delete your account and data</li>
                    <li>Modify your preferences</li>
                    <li>Opt-out of non-essential data collection</li>
                  </ul>
                </Section>

                <Section title="Contact Us">
                  <p>
                    For privacy-related inquiries, contact us at:{" "}
                    <a href="mailto:privacy@bineai.com" className="text-primary hover:underline">
                      privacy@bineai.com
                    </a>
                  </p>
                </Section>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-xl font-medium">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
} 