import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscription, user } from '@/lib/db/schema';
import { StripeService } from '@/lib/payment/stripe-service';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email/send-email';
import { formatCurrency } from '@/lib/utils';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  try {
    const stripeService = StripeService.getInstance();
    const event = await stripeService.handleWebhook(body, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;

        if (userId && planType) {
          // Fetch user details for email
          const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.id, userId));

          // Update user type
          await db.update(user)
            .set({ type: planType })
            .where(eq(user.id, userId));

          // Create or update subscription
          await db.insert(subscription).values({
            userId,
            plan: planType,
            status: 'active',
            startDate: new Date(),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          }).onConflictDoUpdate({
            target: [subscription.userId],
            set: {
              plan: planType,
              status: 'active',
              startDate: new Date(),
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              updatedAt: new Date(),
            },
          });
          
          // Fetch subscription details from Stripe
          const stripeSubscription = await stripeService.getSubscription(session.subscription as string);
          
          if (userData && stripeSubscription && 
              stripeSubscription.items?.data?.[0]?.price?.unit_amount && 
              stripeSubscription.items?.data?.[0]?.price?.recurring?.interval) {
            // Send subscription confirmation email
            await sendEmail({
              to: userData.email,
              type: 'subscriptionConfirmation',
              props: {
                name: userData.firstName || userData.email.split('@')[0],
                planName: planType.charAt(0).toUpperCase() + planType.slice(1),
                amount: formatCurrency(stripeSubscription.items.data[0].price.unit_amount / 100, 
                  stripeSubscription.items.data[0].price.currency || 'usd'),
                billingCycle: stripeSubscription.items.data[0].price.recurring.interval,
                startDate: new Date((stripeSubscription as any).current_period_start * 1000).toLocaleDateString(),
                nextBillingDate: new Date((stripeSubscription as any).current_period_end * 1000).toLocaleDateString(),
                features: getPlanFeatures(planType)
              }
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data;
        const customerId = invoice.customer;
        
        // Find user by Stripe customer ID
        const [userSub] = await db
          .select({
            userId: subscription.userId, 
            plan: subscription.plan
          })
          .from(subscription)
          .where(eq(subscription.stripeCustomerId, customerId as string));
          
        if (userSub) {
          const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.id, userSub.userId));
            
          if (userData) {
            // Send payment failed email
            await sendEmail({
              to: userData.email,
              type: 'paymentFailed',
              props: {
                name: userData.firstName || userData.email.split('@')[0],
                planName: userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1),
                amount: formatCurrency(invoice.amount_due / 100, invoice.currency),
                nextAttemptDate: invoice.next_payment_attempt ? 
                  new Date(invoice.next_payment_attempt * 1000).toLocaleDateString() : undefined,
                cardLastFour: invoice.payment_intent?.payment_method?.card?.last4
              }
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data;
        if (sub.status === 'active') {
          await db.update(subscription)
            .set({
              status: 'active',
              startDate: new Date(sub.current_period_start * 1000),
              endDate: new Date(sub.current_period_end * 1000),
              updatedAt: new Date(),
            })
            .where(eq(subscription.stripeSubscriptionId, sub.id));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data;
        
        // Find the subscription to get userId
        const [userSub] = await db
          .select({ userId: subscription.userId, plan: subscription.plan })
          .from(subscription)
          .where(eq(subscription.stripeSubscriptionId, sub.id));

        if (userSub) {
          // Get user details
          const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.id, userSub.userId));

          // Update user back to regular
          await db.update(user)
            .set({ type: 'regular' })
            .where(eq(user.id, userSub.userId));

          // Update subscription status
          await db.update(subscription)
            .set({
              status: 'expired',
              endDate: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscription.stripeSubscriptionId, sub.id));
            
          // Send cancellation email
          if (userData) {
            // Use a default end date (30 days from now) if the subscription doesn't have current_period_end
            const endDate = 'current_period_end' in sub && typeof sub.current_period_end === 'number' 
              ? new Date(sub.current_period_end * 1000).toLocaleDateString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
              
            await sendEmail({
              to: userData.email,
              type: 'subscriptionCanceled',
              props: {
                name: userData.firstName || userData.email.split('@')[0],
                planName: userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1),
                endDate: endDate
              }
            });
          }
        }
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new NextResponse('Webhook error', { status: 400 });
  }
}

// Helper function to get features based on plan type
function getPlanFeatures(planType: string): string[] {
  switch (planType) {
    case 'advanced':
      return [
        'Increased daily message limit',
        'Access to broader model range',
        'Extended conversation history',
        'Custom AI personas',
        'Early access to new releases'
      ];
    case 'expert':
      return [
        'Unlimited messages',
        'Full model library access',
        'Multi-model chat threads',
        'Premium models access',
        'Chat insights & summaries',
        'API access included',
        'Priority support'
      ];
    default:
      return [];
  }
} 