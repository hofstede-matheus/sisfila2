import * as Joi from 'joi';
import {
  InvalidDateError,
  InvalidEmailError,
  InvalidIdError,
  InvalidPasswordError,
  InvalidUrlError,
  InvalidValueError,
} from '../../domain/errors';
import { Either, left, right } from './either';
import { DomainError } from './errors';

type OrUndefined<T> = (T | undefined)[];

// add a parameter here to validate
// to handle different parameters in different contexts, add a parameter in the following format: ${parameter}${Context}
// eg: validate if email is from organization @mediato.dev:

// interface ValidatorParams {
// ...
//   emailFromOrganization?: string;
// }

// ...
// emailFromOrganization: Joi.string()
//         .email()
//         .regex(pattern)
//         .error(() => new InvalidEmailError()),

interface ValidatorParams {
  email?: OrUndefined<string>;
  id?: OrUndefined<string>;
  url?: OrUndefined<string>;
  password?: OrUndefined<string>;
  date?: OrUndefined<string>;
  userEntityTypes?: OrUndefined<string>;
}

export class Validator {
  static validate(input: ValidatorParams): Either<DomainError, boolean> {
    const schema = Joi.object<ValidatorParams, true>({
      // add rules for each parameter in ValidatorParams
      email: Joi.array()
        .sparse()
        .items(
          Joi.string()
            .email()
            .error(() => new InvalidEmailError()),
        ),

      id: Joi.array()
        .sparse()
        .items(
          Joi.string()
            .uuid()
            .error(() => new InvalidIdError()),
        ),

      url: Joi.array()
        .sparse()
        .items(
          Joi.string()
            .uri()
            .error(() => new InvalidUrlError()),
        ),

      password: Joi.array()
        .sparse()
        .items(
          Joi.string()
            .min(8)
            .error(() => new InvalidPasswordError()),
        ),

      date: Joi.array()
        .sparse()
        .items(Joi.date().error(() => new InvalidDateError())),

      userEntityTypes: Joi.array()
        .sparse()
        .items(
          Joi.string()
            .valid('TYPE_COORDINATOR', 'TYPE_ATTENDENT')
            .error(() => new InvalidValueError()),
        ),
    });

    const validation = schema.validate({ ...input });
    if (validation.error) return left(validation.error);
    return right(true);
  }
}
