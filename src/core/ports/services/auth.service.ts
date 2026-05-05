export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface JwtPayload {
  sub: string;
  exp?: number;
  iat?: number;
}

export interface IJwtService {
  sign(payload: { sub: string }): Promise<string>;
  verify(token: string): Promise<JwtPayload>;
}

export interface OidcTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: Date;
}

export interface OidcUserInfo {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
}

export interface IOidcService {
  getAuthUrl(state: string, nonce: string): Promise<string>;
  handleCallback(
    code: string,
    state: string
  ): Promise<{ tokens: OidcTokens; userInfo: OidcUserInfo }>;
  refreshTokens(refreshToken: string): Promise<OidcTokens>;
}
