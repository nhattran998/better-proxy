import { TOKENS } from './tokens';

// Infrastructure - Repositories
import { DrizzleUserRepository } from '#/modules/auth/infrastructure/drizzle-user.repository';
import {
  DrizzleProviderRepository,
  DrizzleConnectionRepository,
} from '#/modules/providers/infrastructure';
import { DrizzleComboRepository } from '#/modules/combos/infrastructure';
import { DrizzleUsageRepository } from '#/modules/usage/infrastructure';
import { DrizzleQuotaRepository } from '#/modules/quota/infrastructure';
import { DrizzleProxyPoolRepository } from '#/modules/proxy-pool/infrastructure';

// Infrastructure - Services
import { BcryptHasher, JoseJwtService, KeycloakOidcService } from '#/modules/auth/infrastructure';

// Use Cases
import {
  LoginUseCase,
  VerifySessionUseCase,
  OidcCallbackUseCase,
} from '#/modules/auth/application';

// Config
import { env } from '#/shared/infrastructure/config/env';

type Factory<T> = () => T;

class Container {
  private factories = new Map<symbol, Factory<unknown>>();
  private instances = new Map<symbol, unknown>();

  register<T>(token: symbol, factory: Factory<T>): void {
    this.factories.set(token, factory);
  }

  get<T>(token: symbol): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`No binding for ${token.toString()}`);
    }

    const instance = factory() as T;
    this.instances.set(token, instance);
    return instance;
  }

  has(token: symbol): boolean {
    return this.factories.has(token);
  }

  reset(): void {
    this.instances.clear();
  }
}

export const container = new Container();

export function initContainer(): void {
  // ═══════════════════════════════════════════════════════════════
  // REPOSITORIES
  // ═══════════════════════════════════════════════════════════════
  container.register(TOKENS.UserRepository, () => new DrizzleUserRepository());
  container.register(TOKENS.ProviderRepository, () => new DrizzleProviderRepository());
  container.register(TOKENS.ConnectionRepository, () => new DrizzleConnectionRepository());
  container.register(TOKENS.ComboRepository, () => new DrizzleComboRepository());
  container.register(TOKENS.UsageRepository, () => new DrizzleUsageRepository());
  container.register(TOKENS.QuotaRepository, () => new DrizzleQuotaRepository());
  container.register(TOKENS.ProxyPoolRepository, () => new DrizzleProxyPoolRepository());

  // ═══════════════════════════════════════════════════════════════
  // SERVICES
  // ═══════════════════════════════════════════════════════════════
  container.register(TOKENS.PasswordHasher, () => new BcryptHasher());
  container.register(TOKENS.JwtService, () => new JoseJwtService(env.JWT_SECRET));

  if (env.OIDC_ENABLED && env.KEYCLOAK_URL && env.KEYCLOAK_REALM) {
    container.register(
      TOKENS.OidcService,
      () =>
        new KeycloakOidcService({
          url: env.KEYCLOAK_URL!,
          realm: env.KEYCLOAK_REALM!,
          clientId: env.OIDC_CLIENT_ID!,
          clientSecret: env.OIDC_CLIENT_SECRET!,
          redirectUri: env.OIDC_REDIRECT_URI!,
        })
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // USE CASES - AUTH
  // ═══════════════════════════════════════════════════════════════
  container.register(
    TOKENS.LoginUseCase,
    () =>
      new LoginUseCase(
        container.get(TOKENS.UserRepository),
        container.get(TOKENS.PasswordHasher),
        container.get(TOKENS.JwtService)
      )
  );

  container.register(
    TOKENS.VerifySessionUseCase,
    () =>
      new VerifySessionUseCase(
        container.get(TOKENS.UserRepository),
        container.get(TOKENS.JwtService)
      )
  );

  if (container.has(TOKENS.OidcService)) {
    container.register(
      TOKENS.OidcCallbackUseCase,
      () =>
        new OidcCallbackUseCase(
          container.get(TOKENS.UserRepository),
          container.get(TOKENS.OidcService),
          container.get(TOKENS.JwtService),
          container.get(TOKENS.PasswordHasher)
        )
    );
  }
}

// Initialize on import
initContainer();
