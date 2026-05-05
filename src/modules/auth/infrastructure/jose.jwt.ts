import { SignJWT, jwtVerify } from 'jose';
import type { IJwtService, JwtPayload } from '#/core/ports/services/auth.service';

export class JoseJwtService implements IJwtService {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn: string = '7d') {
    this.secret = new TextEncoder().encode(secret);
    this.expiresIn = expiresIn;
  }

  async sign(payload: { sub: string }): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
  }

  async verify(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, this.secret);
    return {
      sub: payload.sub as string,
      exp: payload.exp,
      iat: payload.iat,
    };
  }
}
