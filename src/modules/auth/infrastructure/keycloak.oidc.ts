import * as client from 'openid-client';
import type {
  IOidcService,
  OidcTokens,
  OidcUserInfo,
} from '#/core/ports/services/auth.service';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class KeycloakOidcService implements IOidcService {
  private config: client.Configuration | null = null;
  private readonly keycloakConfig: KeycloakConfig;

  constructor(keycloakConfig: KeycloakConfig) {
    this.keycloakConfig = keycloakConfig;
  }

  private async getConfig(): Promise<client.Configuration> {
    if (!this.config) {
      const issuerUrl = `${this.keycloakConfig.url}/realms/${this.keycloakConfig.realm}`;
      this.config = await client.discovery(
        new URL(issuerUrl),
        this.keycloakConfig.clientId,
        this.keycloakConfig.clientSecret
      );
    }
    return this.config;
  }

  async getAuthUrl(state: string, nonce: string): Promise<string> {
    const config = await this.getConfig();
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      client_id: this.keycloakConfig.clientId,
      redirect_uri: this.keycloakConfig.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authEndpoint = config.serverMetadata().authorization_endpoint;
    if (!authEndpoint) {
      throw new Error('Authorization endpoint not found');
    }

    return `${authEndpoint}?${params.toString()}`;
  }

  async handleCallback(
    code: string,
    _state: string
  ): Promise<{ tokens: OidcTokens; userInfo: OidcUserInfo }> {
    const config = await this.getConfig();

    const params = new URLSearchParams({ code });
    const tokenResponse = await client.authorizationCodeGrant(
      config,
      new URL(`${this.keycloakConfig.redirectUri}?${params.toString()}`)
    );

    const tokens: OidcTokens = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      idToken: tokenResponse.id_token,
      expiresAt: tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined,
    };

    const claims = tokenResponse.claims();
    const userInfo: OidcUserInfo = {
      sub: claims?.sub as string || '',
      email: claims?.email as string | undefined,
      name: claims?.name as string | undefined,
      preferred_username: claims?.preferred_username as string | undefined,
    };

    return { tokens, userInfo };
  }

  async refreshTokens(refreshToken: string): Promise<OidcTokens> {
    const config = await this.getConfig();

    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);

    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      idToken: tokenResponse.id_token,
      expiresAt: tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined,
    };
  }
}
