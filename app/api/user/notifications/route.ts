import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const notificationsSchema = z.object({
  communication_emails: z.boolean().default(true).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean().default(true),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = notificationsSchema.parse(body);

    // Update user notification preferences in database
    await db
      .update(user)
      .set({
        communicationEmails: validatedData.communication_emails,
        marketingEmails: validatedData.marketing_emails,
        socialEmails: validatedData.social_emails,
        securityEmails: validatedData.security_emails,
      })
      .where(eq(user.id, session.user.id));

    return new NextResponse("Notification preferences updated successfully", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    return new NextResponse(
      "Something went wrong updating your notification preferences", 
      { status: 500 }
    );
  }
} 