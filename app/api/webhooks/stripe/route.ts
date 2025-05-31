import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscription, user } from '@/lib/db/schema';
import { StripeService } from '@/lib/payment/stripe-service';
import { eq } from 'drizzle-orm';

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
          .select({ userId: subscription.userId })
          .from(subscription)
          .where(eq(subscription.stripeSubscriptionId, sub.id));

        if (userSub) {
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