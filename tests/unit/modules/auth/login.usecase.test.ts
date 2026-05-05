import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '#/modules/auth/application/login.usecase';
import { InvalidCredentialsError } from '#/core/errors/auth.error';
import type { IUserRepository } from '#/core/ports/repositories/user.repository';
import type { IPasswordHasher, IJwtService } from '#/core/ports/services/auth.service';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepo: IUserRepository;
  let mockHasher: IPasswordHasher;
  let mockJwt: IJwtService;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    passwordHash: 'hashed-password',
    role: 'user' as const,
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    mockJwt = {
      sign: vi.fn(),
      verify: vi.fn(),
    };

    useCase = new LoginUseCase(mockUserRepo, mockHasher, mockJwt);
  });

  it('should return token and user on valid credentials', async () => {
    vi.mocked(mockUserRepo.findByUsername).mockResolvedValue(mockUser);
    vi.mocked(mockHasher.verify).mockResolvedValue(true);
    vi.mocked(mockJwt.sign).mockResolvedValue('jwt-token-123');

    const result = await useCase.execute('testuser', 'password123');

    expect(result.token).toBe('jwt-token-123');
    expect(result.user.id).toBe('user-123');
    expect(result.user.username).toBe('testuser');
    expect(mockUserRepo.findByUsername).toHaveBeenCalledWith('testuser');
    expect(mockHasher.verify).toHaveBeenCalledWith('password123', 'hashed-password');
  });

  it('should throw InvalidCredentialsError when user not found', async () => {
    vi.mocked(mockUserRepo.findByUsername).mockResolvedValue(null);

    await expect(useCase.execute('unknown', 'password')).rejects.toThrow(
      InvalidCredentialsError
    );
  });

  it('should throw InvalidCredentialsError on wrong password', async () => {
    vi.mocked(mockUserRepo.findByUsername).mockResolvedValue(mockUser);
    vi.mocked(mockHasher.verify).mockResolvedValue(false);

    await expect(useCase.execute('testuser', 'wrongpassword')).rejects.toThrow(
      InvalidCredentialsError
    );
  });
});
