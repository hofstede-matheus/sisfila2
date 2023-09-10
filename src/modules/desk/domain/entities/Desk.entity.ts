import * as Joi from 'joi';
import {
  InvalidNameError,
  InvalidIdError,
} from '../../../common/domain/errors';
import { Either, left, right } from '../../../common/shared/helpers/either';
import {
  DomainEntity,
  staticImplements,
} from '../../../common/shared/helpers/entity';
import { DomainError } from '../../../common/shared/helpers/errors';
import { ServiceEntity } from '../../../services/domain/entities/Service.entity';

export interface DeskEntity {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string;
  readonly services: ServiceEntity[];

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

@staticImplements<DomainEntity<DeskEntity>>()
export class DeskEntity {
  private constructor(readonly name: string, readonly organizationId: string) {}

  public static build(
    name: string,
    organizationId: string,
  ): Either<DomainError, DeskEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),

      organizationId: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),
    });

    const validation = schema.validate({
      name,
      organizationId,
    });
    if (validation.error) return left(validation.error);

    return right(new DeskEntity(name, organizationId));
  }
}
