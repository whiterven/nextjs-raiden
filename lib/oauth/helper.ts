// lib/oauth/helper.ts
import crypto from 'crypto';
import { OAUTH_PROVIDERS } from './config';

export class OAuthHelper {
  static generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  static generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  static buildAuthUrl(
    provider: string,
    clientId: string,
    redirectUri: string,
    state: string,
    scopes: string | string[] = 'basic'
  ): string {
    const config = OAUTH_PROVIDERS[provider as keyof typeof OAUTH_PROVIDERS];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    const scopeString = typeof scopes === 'string' 
      ? config.scopes[scopes as keyof typeof config.scopes] || scopes 
      : scopes.map(s => config.scopes[s as keyof typeof config.scopes] || s).join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopeString,
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    provider: string,
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) {
    const config = OAUTH_PROVIDERS[provider as keyof typeof OAUTH_PROVIDERS];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  }
} 