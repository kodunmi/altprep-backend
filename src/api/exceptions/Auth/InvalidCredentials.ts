import { UnauthorizedError } from 'routing-controllers';

export class InvalidCredentials extends UnauthorizedError {
  constructor() {
    super('Invalid credentials!');
  }
}

export class UserNotFound extends UnauthorizedError {
  constructor() {
    super('This email hasn’t been onboarded by any school yet. Please contact your school administrator.');
  }
}