import { DomainError } from '../../shared/helpers/errors';

export class InvalidNameError extends DomainError {
  constructor(name) {
    super(name);
  }
}

export class InvalidEmailError extends DomainError {
  constructor(name) {
    super(name);
  }
}

export class InvalidPasswordError extends DomainError {
  constructor(name) {
    super(name);
  }
}

export class InvalidUserTypeError extends DomainError {
  constructor(name) {
    super(name);
  }
}
