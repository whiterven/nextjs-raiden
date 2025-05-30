import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { chat } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all chats for the user
    await db
      .delete(chat)
      .where(eq(chat.userId, session.user.id));

    return new NextResponse("Chats deleted successfully", { status: 200 });
  } catch (error) {
    return new NextResponse(
      "Something went wrong deleting your chats", 
      { status: 500 }
    );
  }
} 