import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const languageSchema = z.object({
  language: z.string({
    required_error: "Please select a language.",
  }),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = languageSchema.parse(body);

    // Update user language preference in database
    await db
      .update(user)
      .set({
        language: validatedData.language,
      })
      .where(eq(user.id, session.user.id));

    return new NextResponse("Language preference updated successfully", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    return new NextResponse(
      "Something went wrong updating your language preference", 
      { status: 500 }
    );
  }
}