import type { IPasswordHasher, IJwtService } from '#/core/ports/services/auth.service';
import type { IUserRepository } from '#/core/ports/repositories/user.repository';
import { InvalidCredentialsError } from '#/core/errors/auth.error';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly jwt: IJwtService
  ) {}

  async execute(username: string, password: string): Promise<LoginResult> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await this.hasher.verify(password, user.passwordHash);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    const token = await this.jwt.sign({ sub: user.id });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
