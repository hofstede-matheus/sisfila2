import * as Joi from 'joi';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainEntity, staticImplements } from '../../shared/helpers/entity';
import { DomainError } from '../../shared/helpers/errors';
import {
  InvalidEmailError,
  InvalidNameError,
  InvalidPasswordError,
} from '../errors';

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
  ) {}

  public static build(
    name: string,
    email: string,
    password: string,
  ): Either<DomainError, UserEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),
      email: Joi.string()
        .email()
        .required()
        .error(() => new InvalidEmailError()),
      password: Joi.string()
        .min(8)
        .required()
        .error(() => new InvalidPasswordError()),
    });

    const validation = schema.validate({ name, email, password });
    if (validation.error) return left(validation.error);

    return right(new UserEntity(name, email, password));
  }
}
