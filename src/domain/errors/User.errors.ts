import { DomainError } from '../../shared/helpers/errors';

export class InvalidNameError extends DomainError {}

export class InvalidEmailError extends DomainError {}

export class InvalidPasswordError extends DomainError {}

export class InvalidUserTypeError extends DomainError {}
