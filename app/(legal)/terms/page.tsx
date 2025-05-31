import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Terms of Service | BineAI",
  description: "Terms of Service for BineAI - Your Universal AI Chat Platform",
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="space-y-8">
                <Section title="1. Agreement to Terms">
                  <p>
                    By accessing or using BineAI&apos;s services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </Section>

                <Section title="2. Service Description">
                  <SubSection title="Platform Overview">
                    <p>BineAI provides a unified platform for accessing multiple AI models through a single interface, including:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Access to various AI models (OpenAI, Claude, Grok, Gemini, DeepSeek)</li>
                      <li>Continuous conversation threads across different models</li>
                      <li>Secure data handling and storage</li>
                      <li>User account management</li>
                      <li>Subscription-based services</li>
                    </ul>
                  </SubSection>
                </Section>

                <Section title="3. Subscription Plans">
                  <SubSection title="Free Tier">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>5 free messages per day</li>
                      <li>Access to select open-source models</li>
                      <li>Basic chat features</li>
                    </ul>
                  </SubSection>

                  <SubSection title="Advanced Tier ($19/month)">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Increased daily message limit</li>
                      <li>Access to broader model range</li>
                      <li>Extended conversation history</li>
                      <li>Custom AI personas</li>
                    </ul>
                  </SubSection>

                  <SubSection title="Expert Tier ($41/month)">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Unlimited messages</li>
                      <li>Full model library access</li>
                      <li>Premium features and support</li>
                      <li>API access included</li>
                    </ul>
                  </SubSection>
                </Section>

                <Section title="4. User Responsibilities">
                  <SubSection title="Account Security">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Maintain confidentiality of account credentials</li>
                      <li>Use strong passwords and enable 2FA when available</li>
                      <li>Report unauthorized access immediately</li>
                      <li>One account per user/entity</li>
                    </ul>
                  </SubSection>

                  <SubSection title="Acceptable Use">
                    <p>Users must not:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Generate harmful or illegal content</li>
                      <li>Attempt to reverse engineer the platform</li>
                      <li>Automate access without authorization</li>
                      <li>Share account access with others</li>
                      <li>Violate intellectual property rights</li>
                    </ul>
                  </SubSection>
                </Section>

                <Section title="5. Payment Terms">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All prices are in USD unless specified otherwise</li>
                    <li>Subscriptions are billed automatically</li>
                    <li>No refunds for partial month usage</li>
                    <li>30-day notice required for cancellation</li>
                  </ul>
                </Section>

                <Section title="6. Intellectual Property">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Platform and interface are proprietary to BineAI</li>
                    <li>Users retain rights to their input content</li>
                    <li>AI-generated content subject to model provider terms</li>
                    <li>Limited license granted for platform use</li>
                  </ul>
                </Section>

                <Section title="7. Limitation of Liability">
                  <p>
                    BineAI provides services &ldquo;as is&rdquo; without warranties. We are not liable for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Accuracy of AI model outputs</li>
                    <li>Service interruptions</li>
                    <li>Data loss or corruption</li>
                    <li>Third-party content or services</li>
                  </ul>
                </Section>

                <Section title="8. Termination">
                  <p>
                    We reserve the right to terminate or suspend access to our services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>For violations of these terms</li>
                    <li>Non-payment of fees</li>
                    <li>Fraudulent or illegal activities</li>
                    <li>At our discretion with notice</li>
                  </ul>
                </Section>

                <Section title="9. Changes to Terms">
                  <p>
                    We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of new terms. Material changes will be notified via email.
                  </p>
                </Section>

                <Section title="10. Contact Us">
                  <p>
                    For questions about these terms, contact us at:{" "}
                    <a href="mailto:legal@bineai.com" className="text-primary hover:underline">
                      legal@bineai.com
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