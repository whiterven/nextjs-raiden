import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Maximum avatar file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types for avatar images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify that the request contains form data
    const formData = await req.formData();
    const avatarFile = formData.get('avatar') as File;
    
    if (!avatarFile) {
      return new NextResponse("No avatar file provided", { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(avatarFile.type)) {
      return new NextResponse(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        { status: 400 }
      );
    }

    // Validate file size
    if (avatarFile.size > MAX_FILE_SIZE) {
      return new NextResponse(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        { status: 400 }
      );
    }

    // Convert the file to a Base64 string for storage
    const fileBuffer = await avatarFile.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const dataUrl = `data:${avatarFile.type};base64,${base64Data}`;

    // Update the user's avatar in the database
    await db
      .update(user)
      .set({
        avatarUrl: dataUrl,
        updatedAt: new Date()
      })
      .where(eq(user.id, session.user.id));

    return new NextResponse("Avatar updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return new NextResponse(
      "Something went wrong updating your avatar", 
      { status: 500 }
    );
  }
}

// API to remove avatar
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the user's avatar in the database to null
    await db
      .update(user)
      .set({
        avatarUrl: null,
        updatedAt: new Date()
      })
      .where(eq(user.id, session.user.id));

    return new NextResponse("Avatar removed successfully", { status: 200 });
  } catch (error) {
    console.error("Error removing avatar:", error);
    return new NextResponse(
      "Something went wrong removing your avatar", 
      { status: 500 }
    );
  }
} 