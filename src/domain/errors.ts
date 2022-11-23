import { DomainError } from '../shared/helpers/errors';

export class InvalidNameError extends DomainError {}

export class InvalidEmailError extends DomainError {}

export class InvalidPasswordError extends DomainError {}

export class InvalidUserTypeError extends DomainError {}

export class InvalidIdError extends DomainError {}

export class InvalidUrlError extends DomainError {}

export class InvalidDateError extends DomainError {}

export class InvalidCredentialsError extends DomainError {}

export class InvalidOauthDataError extends DomainError {}

export class EmailAlreadyExistsError extends DomainError {}

export class InvalidCodeError extends DomainError {}

export class OrganizationCodeAlreadyUsedError extends DomainError {}

export class OrganizationNotFoundError extends DomainError {}

export class UserNotFoundError extends DomainError {}

export class InvalidValueError extends DomainError {}

export class InvalidPriorityError extends DomainError {}

export class ServiceNotFoundError extends DomainError {}

export class QueueNotFoundError extends DomainError {}

export class GroupNotFoundError extends DomainError {}

export class ClientAlreadyExistsError extends DomainError {}
