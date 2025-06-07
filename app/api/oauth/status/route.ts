import { NextRequest, NextResponse } from 'next/server';
import { getUserOAuthTokens } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's connected integrations from database
    const integrations = await getUserOAuthTokens({
      userId: session.user.id
    });

    return NextResponse.json({
      integrations: integrations.map(integration => ({
        provider: integration.provider,
        connected_at: integration.createdAt,
        updated_at: integration.updatedAt,
        scopes: integration.scope,
        expires_at: integration.expiresAt
      }))
    });
  } catch (error) {
    console.error('OAuth status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 