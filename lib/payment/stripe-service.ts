import Stripe from 'stripe';
import { env } from '@/env.mjs';
import type { UserType } from '@/app/(auth)/auth';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

export const PLAN_PRICES = {
  advanced: { price_id: env.STRIPE_ADVANCED_PRICE_ID, amount: 1900 }, // $19.00
  expert: { price_id: env.STRIPE_EXPERT_PRICE_ID, amount: 4100 }, // $41.00
} as const;

export type PlanType = keyof typeof PLAN_PRICES;
export type PaidPlanType = PlanType; // For clarity when using paid plans only

interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  planType: PlanType;
  returnUrl: string;
  cancelUrl: string;
}

interface ManageSubscriptionParams {
  userId: string;
  returnUrl: string;
}

export class StripeService {
  private static instance: StripeService;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createCustomer(email: string, userId: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createCheckoutSession({
    userId,
    email,
    planType,
    returnUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams) {
    try {
      // Get or create customer
      let customer = await this.getCustomerByUserId(userId);
      
      if (!customer) {
        customer = await this.createCustomer(email, userId);
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
          {
            price: PLAN_PRICES[planType].price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planType,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async createPortalSession({ userId, returnUrl }: ManageSubscriptionParams) {
    try {
      const customer = await this.getCustomerByUserId(userId);
      
      if (!customer) {
        throw new Error('Customer not found');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  async getCustomerByUserId(userId: string) {
    try {
      const customers = await stripe.customers.search({
        query: `metadata['userId']:'${userId}'`,
      });

      return customers.data[0];
    } catch (error) {
      console.error('Error fetching Stripe customer:', error);
      return null;
    }
  }

  async handleWebhook(
    body: string | Buffer,
    signature: string,
  ): Promise<{ type: string; data: any }> {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );

      return {
        type: event.type,
        data: event.data.object,
      };
    } catch (error) {
      console.error('Error verifying webhook:', error);
      throw new Error('Webhook signature verification failed');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async updateSubscription(subscriptionId: string, planType: PlanType) {
    try {
      return await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            price: PLAN_PRICES[planType].price_id,
          },
        ],
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }
} 