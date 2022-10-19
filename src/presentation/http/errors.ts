import { HttpException } from '@nestjs/common';
import {
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidNameError,
  InvalidPasswordError,
  InvalidUserTypeError,
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

    default:
      console.error('ERROR NOT MAPPED', error);
      return new HttpException('Internal server error', 500);
  }
}
