import Joi from 'joi';
import { Either, left, right } from '../../shared/helpers/either';
import { staticImplements, DomainEntity } from '../../shared/helpers/entity';
import { DomainError } from '../../shared/helpers/errors';
import { InvalidNameError } from '../errors';

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
        .error(() => new InvalidNameError()),

      registrationId: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),
    });

    const validation = schema.validate({
      name,
      organizationId,
      registrationId,
    });
    if (validation.error) return left(validation.error);

    return right(new ClientEntity(name, organizationId, registrationId));
  }
}
