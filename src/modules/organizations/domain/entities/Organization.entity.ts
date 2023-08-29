import * as Joi from 'joi';
import { Either, left, right } from '../../../common/shared/helpers/either';
import {
  staticImplements,
  DomainEntity,
} from '../../../common/shared/helpers/entity';
import { DomainError } from '../../../common/shared/helpers/errors';
import {
  InvalidCodeError,
  InvalidNameError,
} from '../../../common/domain/errors';

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
