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
import { ClientEntity } from '../../../clients/domain/entities/Client.entity';

export interface GroupEntity {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string;

  readonly clients: ClientEntity[];

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

@staticImplements<DomainEntity<GroupEntity>>()
export class GroupEntity {
  private constructor(readonly name: string) {}

  public static build(name: string): Either<DomainError, GroupEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),
    });

    const validation = schema.validate({ name });
    if (validation.error) return left(validation.error);

    return right(new GroupEntity(name));
  }

  public static validateEdit(
    id: string,
    name: string,
    organizationId: string,
  ): Either<DomainError, void> {
    const schema = Joi.object({
      id: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),

      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),

      organizationId: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),
    });

    const validation = schema.validate({ id, name, organizationId });
    if (validation.error) return left(validation.error);

    return right();
  }
}
