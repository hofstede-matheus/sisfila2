import * as Joi from 'joi';
import { Either, left, right } from '../../shared/helpers/either';
import { staticImplements, DomainEntity } from '../../shared/helpers/entity';
import { DomainError } from '../../shared/helpers/errors';
import { InvalidCodeError, InvalidNameError } from '../errors';

export interface OrganizationEntity {
  readonly id: string;
  readonly name: string;
  readonly code: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type OrganizationEntityTypes = 'TYPE_COORDINATOR' | 'TYPE_ATTENDENT';

@staticImplements<DomainEntity<OrganizationEntity>>()
export class OrganizationEntity {
  private constructor(readonly name: string, readonly code: string) {}

  public static build(
    name: string,
    code: string,
  ): Either<DomainError, OrganizationEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),
      code: Joi.string()
        .min(2)
        .max(10)
        .required()
        .error(() => new InvalidCodeError()),
    });

    const validation = schema.validate({ name, code });
    if (validation.error) return left(validation.error);

    return right(new OrganizationEntity(name, code));
  }
}
