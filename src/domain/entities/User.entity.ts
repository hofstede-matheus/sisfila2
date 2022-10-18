import Joi from 'joi';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainEntity, staticImplements } from '../../shared/helpers/entity';
import { DomainError } from '../../shared/helpers/errors';
import {
  InvalidEmailError,
  InvalidNameError,
  InvalidPasswordError,
  InvalidUserTypeError,
} from '../errors/User.errors';

export interface UserEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly userType: UserEntityTypes;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type UserEntityTypes = 'TYPE_COORDINATOR' | 'TYPE_ATTENDENT';

@staticImplements<DomainEntity<UserEntity>>()
export class UserEntity {
  private constructor(
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly userType: UserEntityTypes,
  ) {}

  public static build(
    username: string,
    email: string,
    password: string,
    userType: UserEntityTypes,
  ): Either<DomainError, UserEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .alphanum()
        .required()
        .error((error) => new InvalidNameError(error.toString())),
      email: Joi.string()
        .email()
        .required()
        .error((error) => new InvalidEmailError(error.toString())),
      password: Joi.string()
        .min(8)
        .required()
        .error((error) => new InvalidPasswordError(error.toString())),
      userType: Joi.string()
        .min(8)
        .valid('TYPE_COORDINATOR', 'TYPE_ATTENDENT')
        .required()
        .error((error) => new InvalidUserTypeError(error.toString())),
    });

    const validation = schema.validate({ name, email, password, userType });
    if (validation.error) return left(validation.error);

    return right(new UserEntity(username, email, password, userType));
  }
}
