import * as Joi from 'joi';
import { Either, left, right } from '../../../common/shared/helpers/either';
import {
  DomainEntity,
  staticImplements,
} from '../../../common/shared/helpers/entity';
import { DomainError } from '../../../common/shared/helpers/errors';
import {
  InvalidEmailError,
  InvalidIdError,
  InvalidNameError,
  InvalidPasswordError,
  InvalidUserTypeError,
} from '../../../common/domain/errors';

export interface RolesInOrganizations {
  readonly organizationId: string;
  readonly role: UserEntityTypes;
}

export interface UserEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password?: string;
  readonly isSuperAdmin: boolean;

  readonly rolesInOrganizations: RolesInOrganizations[];

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export enum UserEntityTypes {
  TYPE_COORDINATOR = 'TYPE_COORDINATOR',
  TYPE_ATTENDENT = 'TYPE_ATTENDENT',
}

// export type UserEntityTypes = 'TYPE_COORDINATOR' | 'TYPE_ATTENDENT';

@staticImplements<DomainEntity<UserEntity>>()
export class UserEntity {
  private constructor(
    readonly name: string,
    readonly email: string,
    readonly password?: string,
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

  public static validateEdit(
    userId: string,
    organizationId: string,
    role: UserEntityTypes,
    userEmail: string,
  ): Either<DomainError, void> {
    const schema = Joi.object({
      id: Joi.string()
        .uuid()
        .error(() => new InvalidIdError()),
      organizationId: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),
      role: Joi.string()
        .valid(UserEntityTypes.TYPE_COORDINATOR, UserEntityTypes.TYPE_ATTENDENT)
        .required()
        .error(() => new InvalidUserTypeError()),
      email: Joi.string()
        .email()
        .error(() => new InvalidEmailError()),
    });

    const validation = schema.validate({
      id: userId,
      organizationId,
      role,
      email: userEmail,
    });
    if (validation.error) return left(validation.error);

    return right();
  }
}
