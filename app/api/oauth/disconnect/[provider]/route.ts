import { NextRequest, NextResponse } from 'next/server';
import { deleteOAuthToken } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

// Using Next.js dynamic segment for route parameters
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;

    // Remove tokens from database
    await deleteOAuthToken({
      userId: session.user.id,
      provider
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Integration disconnected successfully' 
    });
  } catch (error) {
    console.error('OAuth disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 