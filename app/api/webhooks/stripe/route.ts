import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscription, user } from '@/lib/db/schema';
import { StripeService } from '@/lib/payment/stripe-service';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature', { status: 400 });
    }

    const stripeService = StripeService.getInstance();
    const event = await stripeService.handleWebhook(body, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data;
        const userId = session.metadata.userId;
        const planType = session.metadata.planType;

        // Update user type and create subscription
        await db.transaction(async (tx) => {
          await tx
            .update(user)
            .set({ type: planType })
            .where(eq(user.id, userId));

          await tx.insert(subscription).values({
            userId,
            plan: planType,
            status: 'active',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          });
        });

        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data;
        const stripeSubId = sub.id;

        await db
          .update(subscription)
          .set({
            status: sub.status === 'active' ? 'active' : 'expired',
            updatedAt: new Date(),
          })
          .where(eq(subscription.stripeSubscriptionId, stripeSubId));

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data;
        const stripeSubId = sub.id;

        await db.transaction(async (tx) => {
          const [userSub] = await tx
            .select({ userId: subscription.userId })
            .from(subscription)
            .where(eq(subscription.stripeSubscriptionId, stripeSubId));

          if (userSub) {
            await tx
              .update(user)
              .set({ type: 'regular' })
              .where(eq(user.id, userSub.userId));

            await tx
              .update(subscription)
              .set({
                status: 'expired',
                endDate: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(subscription.stripeSubscriptionId, stripeSubId));
          }
        });

        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new NextResponse(
      'Webhook error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 400 },
    );
  }
} 