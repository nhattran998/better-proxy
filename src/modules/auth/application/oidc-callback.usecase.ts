import type { IOidcService, IJwtService } from '#/core/ports/services/auth.service';
import type { IUserRepository } from '#/core/ports/repositories/user.repository';
import type { IPasswordHasher } from '#/core/ports/services/auth.service';
import { generateId } from '#/shared/utils';

export interface OidcCallbackResult {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
  isNewUser: boolean;
}

export class OidcCallbackUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly oidc: IOidcService,
    private readonly jwt: IJwtService,
    private readonly hasher: IPasswordHasher
  ) {}

  async execute(code: string, state: string): Promise<OidcCallbackResult> {
    const { userInfo } = await this.oidc.handleCallback(code, state);

    const username = userInfo.preferred_username || userInfo.email || userInfo.sub;
    let user = await this.userRepo.findByUsername(username);
    let isNewUser = false;

    if (!user) {
      const randomPassword = generateId();
      const passwordHash = await this.hasher.hash(randomPassword);

      user = await this.userRepo.create({
        username,
        passwordHash,
        role: 'user',
      });
      isNewUser = true;
    }

    const token = await this.jwt.sign({ sub: user.id });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      isNewUser,
    };
  }
}
