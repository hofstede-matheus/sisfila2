import Joi from 'joi';
import { Either, left, right } from '../../shared/helpers/either';
import { staticImplements, DomainEntity } from '../../shared/helpers/entity';
import { DomainError } from '../../shared/helpers/errors';
import { InvalidNameError } from '../errors';

export interface GroupEntity {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string;

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
}
