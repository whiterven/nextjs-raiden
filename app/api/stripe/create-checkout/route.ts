import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { StripeService } from "@/lib/payment/stripe-service";

const createCheckoutSchema = z.object({
  planType: z.enum(["advanced", "expert"]),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = createCheckoutSchema.parse(json);

    const stripeService = StripeService.getInstance();
    const checkoutSession = await stripeService.createCheckoutSession({
      userId: session.user.id,
      email: session.user.email!,
      planType: body.planType,
      returnUrl: body.returnUrl,
      cancelUrl: body.cancelUrl,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    console.error("[STRIPE_CREATE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 