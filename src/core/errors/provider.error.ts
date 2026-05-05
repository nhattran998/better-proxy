import { DomainError } from './base.error';

export class ProviderError extends DomainError {
  constructor(message: string, code: string = 'PROVIDER_ERROR') {
    super(message, code);
  }
}

export class ProviderUnavailableError extends ProviderError {
  constructor(provider: string) {
    super(`Provider ${provider} unavailable`, 'PROVIDER_UNAVAILABLE');
  }
}

export class AllProvidersExhaustedError extends ProviderError {
  constructor() {
    super('All providers exhausted', 'ALL_PROVIDERS_EXHAUSTED');
  }
}

export class InvalidModelError extends ProviderError {
  constructor(model: string) {
    super(`Invalid model: ${model}`, 'INVALID_MODEL');
  }
}
