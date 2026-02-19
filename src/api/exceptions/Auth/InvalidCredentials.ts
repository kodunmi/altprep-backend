import { UnauthorizedError } from 'routing-controllers';

export class InvalidCredentials extends UnauthorizedError {
  constructor() {
    super('Invalid credentials!');
  }
}

export class UserNotFound extends UnauthorizedError {
  constructor() {
    super('This user does not exist!');
  }
}
