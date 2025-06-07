import { NextRequest, NextResponse } from 'next/server';
import { getOAuthToken, refreshOAuthToken } from '@/lib/db/queries';
import { OAUTH_PROVIDERS } from '@/lib/oauth/config';
import { auth } from '@/app/(auth)/auth';

// Using Next.js dynamic segment for route parameters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;
    const token = await getOAuthToken({
      userId: session.user.id,
      provider
    });

    if (!token) {
      return NextResponse.json(
        { error: 'No token found for this provider' },
        { status: 404 }
      );
    }

    // Check if token is expired and refresh if needed
    if (token.expiresAt && new Date(token.expiresAt) <= new Date()) {
      const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
      const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
      
      if (!clientId || !clientSecret || !token.refreshToken) {
        return NextResponse.json(
          { error: 'Unable to refresh token' },
          { status: 401 }
        );
      }

      // Call provider's token endpoint to refresh the token
      const config = OAUTH_PROVIDERS[provider as keyof typeof OAUTH_PROVIDERS];
      if (!config) {
        return NextResponse.json(
          { error: 'Provider not supported' },
          { status: 400 }
        );
      }

      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken
        }).toString()
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to refresh token' },
          { status: 401 }
        );
      }

      const refreshedToken = await response.json();
      
      // Calculate new expiry time
      const expiresAt = refreshedToken.expires_in 
        ? new Date(Date.now() + refreshedToken.expires_in * 1000)
        : undefined;

      // Update token in database
      await refreshOAuthToken({
        userId: session.user.id,
        provider,
        accessToken: refreshedToken.access_token,
        refreshToken: refreshedToken.refresh_token || token.refreshToken,
        expiresAt
      });

      return NextResponse.json({
        access_token: refreshedToken.access_token,
        token_type: refreshedToken.token_type || token.tokenType,
        expires_at: expiresAt
      });
    }

    // Return existing valid token
    return NextResponse.json({
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_at: token.expiresAt
    });
  } catch (error) {
    console.error('OAuth token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 