import type { IJwtService } from '#/core/ports/services/auth.service';
import type { IUserRepository } from '#/core/ports/repositories/user.repository';
import { SessionExpiredError, AuthError } from '#/core/errors/auth.error';

export interface SessionUser {
  id: string;
  username: string;
  role: string;
}

export class VerifySessionUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwt: IJwtService
  ) {}

  async execute(token: string): Promise<SessionUser> {
    let payload;
    try {
      payload = await this.jwt.verify(token);
    } catch {
      throw new SessionExpiredError();
    }

    if (!payload.sub) {
      throw new AuthError('Invalid token payload');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new AuthError('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }
}
