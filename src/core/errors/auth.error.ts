import { DomainError } from './base.error';

export class AuthError extends DomainError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials');
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('Session expired');
  }
}
