import { NextRequest, NextResponse } from 'next/server';
import { OAuthHelper } from '@/lib/oauth/helper';
import { OAUTH_PROVIDERS } from '@/lib/oauth/config';
import { verifyAndConsumeOAuthState, saveOAuthToken } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

// Using Next.js dynamic segment for route parameters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=missing_parameters`
      );
    }

    // Get current user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?callbackUrl=/settings`
      );
    }

    // Verify state
    const stateRecord = await verifyAndConsumeOAuthState({
      userId: session.user.id,
      provider,
      state
    });

    if (!stateRecord) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=invalid_state`
      );
    }

    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/${provider}`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=configuration_error`
      );
    }

    // Exchange code for tokens
    const tokenData = await OAuthHelper.exchangeCodeForToken(
      provider,
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    // Calculate expiration
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : undefined;

    // Store tokens in database
    await saveOAuthToken({
      userId: session.user.id,
      provider,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      scope: tokenData.scope || stateRecord.scopes,
      tokenType: tokenData.token_type || 'Bearer'
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=connected&provider=${provider}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=connection_failed`
    );
  }
} 