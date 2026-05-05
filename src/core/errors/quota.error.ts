import { DomainError } from './base.error';

export class QuotaError extends DomainError {
  constructor(message: string, code: string = 'QUOTA_ERROR') {
    super(message, code);
  }
}

export class QuotaExhaustedError extends QuotaError {
  constructor(connectionId: string) {
    super(`Quota exhausted for connection ${connectionId}`, 'QUOTA_EXHAUSTED');
  }
}
