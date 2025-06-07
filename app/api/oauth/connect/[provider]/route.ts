import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '@/lib/oauth/helper';
import { OAUTH_PROVIDERS } from '@/lib/oauth/config';
import { saveOAuthState } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

// Using Next.js dynamic segment for route parameters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    // Get current user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const scopes = searchParams.get('scopes') || 'basic';

    if (!OAUTH_PROVIDERS[provider as keyof typeof OAUTH_PROVIDERS]) {
      return NextResponse.json(
        { error: 'Provider not supported' },
        { status: 400 }
      );
    }

    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/${provider}`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'OAuth configuration missing' },
        { status: 400 }
      );
    }

    // Generate state for CSRF protection
    const state = OAuthHelper.generateState();
    
    // Use PKCE for additional security
    const codeVerifier = OAuthHelper.generateCodeVerifier();
    const codeChallenge = OAuthHelper.generateCodeChallenge(codeVerifier);

    // Store state in database
    await saveOAuthState({
      userId: session.user.id,
      provider,
      state,
      codeVerifier,
      scopes,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10) // 10 min expiry
    });

    // Build authorization URL
    const authUrl = OAuthHelper.buildAuthUrl(
      provider,
      clientId,
      redirectUri,
      state,
      scopes
    );

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth connect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 