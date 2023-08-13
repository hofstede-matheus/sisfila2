import { HttpException } from '@nestjs/common';
import {
  ClientAlreadyExistsError,
  ClientNotFoundError,
  ClientNotInQueueError,
  EmailAlreadyExistsError,
  InvalidClientError,
  InvalidCodeError,
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidIdError,
  InvalidNameError,
  InvalidPasswordError,
  InvalidUserTypeError,
  InvalidValueError,
  OrganizationCodeAlreadyUsedError,
  QueueNotFoundError,
  ServiceNotOpenError,
  UserNotFoundError,
  UserNotFromOrganizationError,
  UserNotInGroupError,
} from '../../domain/errors';
import { DomainError } from '../../shared/helpers/errors';

export class PresentationException extends HttpException {
  constructor(error: DomainError, statusCode: number) {
    super(
      { error: error.constructor.name, message: error.message },
      statusCode,
    );
  }
}

export function toPresentationError(error: DomainError): HttpException {
  switch (error.constructor) {
    case InvalidNameError:
      return new PresentationException(error, 400);

    case InvalidEmailError:
      return new PresentationException(error, 400);

    case InvalidPasswordError:
      return new PresentationException(error, 400);

    case InvalidUserTypeError:
      return new PresentationException(error, 400);

    case InvalidCredentialsError:
      return new PresentationException(error, 401);

    case EmailAlreadyExistsError:
      return new PresentationException(error, 409);

    case InvalidCodeError:
      return new PresentationException(error, 400);

    case OrganizationCodeAlreadyUsedError:
      return new PresentationException(error, 409);

    case InvalidIdError:
      return new PresentationException(error, 400);

    case InvalidValueError:
      return new PresentationException(error, 400);

    case ClientAlreadyExistsError:
      return new PresentationException(error, 409);

    case ClientNotFoundError:
      return new PresentationException(error, 404);

    case UserNotFoundError:
      return new PresentationException(error, 404);

    case UserNotFromOrganizationError:
      return new PresentationException(error, 401);

    case InvalidClientError:
      return new PresentationException(error, 401);

    case UserNotInGroupError:
      return new PresentationException(error, 401);

    case QueueNotFoundError:
      return new PresentationException(error, 404);

    case ServiceNotOpenError:
      return new PresentationException(error, 401);

    case ClientNotInQueueError:
      return new PresentationException(error, 400);

    default:
      console.error('ERROR NOT MAPPED', error);
      return new HttpException('Internal server error', 500);
  }
}
