import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { user, chat } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all user data in a transaction
    await db.transaction(async (tx) => {
      // Delete all chats first (due to foreign key constraints)
      await tx
        .delete(chat)
        .where(eq(chat.userId, session.user.id));

      // Delete the user
      await tx
        .delete(user)
        .where(eq(user.id, session.user.id));
    });

    return new NextResponse("Account deleted successfully", { status: 200 });
  } catch (error) {
    return new NextResponse(
      "Something went wrong deleting your account", 
      { status: 500 }
    );
  }
} 