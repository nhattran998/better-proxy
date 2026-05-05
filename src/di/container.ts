import { TOKENS } from './tokens';

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

  reset(): void {
    this.instances.clear();
  }
}

export const container = new Container();

export function initContainer(): void {
  // Repositories will be registered here in Phase 2
  // Services will be registered here in Phase 2
  // Use cases will be registered as modules are implemented
}

// Initialize on import
initContainer();
