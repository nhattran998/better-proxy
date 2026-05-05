import { hash, compare } from 'bcryptjs';
import type { IPasswordHasher } from '#/core/ports/services/auth.service';

export class BcryptHasher implements IPasswordHasher {
  private readonly ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return hash(password, this.ROUNDS);
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
