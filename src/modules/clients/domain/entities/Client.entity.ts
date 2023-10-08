import * as Joi from 'joi';
import { Either, left, right } from '../../../common/shared/helpers/either';
import {
  staticImplements,
  DomainEntity,
} from '../../../common/shared/helpers/entity';
import { DomainError } from '../../../common/shared/helpers/errors';
import {
  InvalidIdError,
  InvalidNameError,
} from '../../../common/domain/errors';

export interface ClientEntity {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string;
  readonly registrationId: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

@staticImplements<DomainEntity<ClientEntity>>()
export class ClientEntity {
  private constructor(
    readonly name: string,
    readonly organizationId: string,
    readonly registrationId: string,
  ) {}

  public static build(
    name: string,
    organizationId: string,
    registrationId: string,
  ): Either<DomainError, ClientEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),

      organizationId: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),

      registrationId: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidIdError()),
    });

    const validation = schema.validate({
      name,
      organizationId,
      registrationId,
    });
    if (validation.error) return left(validation.error);

    return right(new ClientEntity(name, organizationId, registrationId));
  }

  public static validateEdit(
    id: string,
    name: string,
    organizationId: string,
  ): Either<DomainError, void> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .error(() => new InvalidNameError()),

      id: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),

      organizationId: Joi.string()
        .uuid()
        .error(() => new InvalidIdError()),
    });

    const validation = schema.validate({
      name,
      id,
      organizationId,
    });

    if (validation.error) return left(validation.error);

    return right();
  }
}
