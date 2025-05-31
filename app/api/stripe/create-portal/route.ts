import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { StripeService } from "@/lib/payment/stripe-service";

const createPortalSchema = z.object({
  returnUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = createPortalSchema.parse(json);

    const stripeService = StripeService.getInstance();
    const portalSession = await stripeService.createPortalSession({
      userId: session.user.id,
      returnUrl: body.returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    console.error("[STRIPE_CREATE_PORTAL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 