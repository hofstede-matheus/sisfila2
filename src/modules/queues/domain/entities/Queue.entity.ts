import * as Joi from 'joi';
import { Either, left, right } from '../../../common/shared/helpers/either';
import {
  staticImplements,
  DomainEntity,
} from '../../../common/shared/helpers/entity';
import { DomainError } from '../../../common/shared/helpers/errors';
import {
  InvalidNameError,
  InvalidPriorityError,
  InvalidCodeError,
  InvalidIdError,
  InvalidDescriptionError,
} from '../../../common/domain/errors';
import { GroupEntity } from '../../../groups/domain/entities/Group.entity';
import {
  DeskEntity,
  DeskWithoutServicesAndAttendant,
} from '../../../desk/domain/entities/Desk.entity';

export interface QueueEntity {
  readonly id: string;

  readonly name: string;
  readonly priority: number;
  readonly code: string;
  readonly description?: string;
  readonly organizationId: string;
  readonly serviceId: string;

  readonly clientsInQueue?: ClientInQueue[];
  readonly lastClientCalled?: ClientInQueue;
  readonly groups: GroupEntity[];

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ClientInQueue {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string;
  readonly registrationId: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly calledDate?: Date;
  readonly attendedByUserId?: string;
}

export interface PositionInQueueWithDesk {
  readonly position: number;
  readonly desk?: DeskWithoutServicesAndAttendant;
}

@staticImplements<DomainEntity<QueueEntity>>()
export class QueueEntity {
  private constructor(
    readonly name: string,
    readonly code: string,
    readonly description?: string,
  ) {}

  public static build(
    name: string,
    code: string,
    description?: string,
  ): Either<DomainError, QueueEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),
      code: Joi.string()
        .required()
        .min(2)
        .error(() => new InvalidCodeError()),
    });

    const validation = schema.validate({ name, code });
    if (validation.error) return left(validation.error);

    return right(new QueueEntity(name, code, description));
  }

  public static validateEdit(
    userId: string,
    organizationId: string,
    queueId: string,
    groupIds?: string[],
    serviceId?: string,
    name?: string,
    description?: string,
    code?: string,
    priority?: number,
  ): Either<DomainError, void> {
    const schema = Joi.object({
      id: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),
      organizationId: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),
      queueId: Joi.string()
        .uuid()
        .error(() => new InvalidIdError()),
      groupIds: Joi.array()
        .items(Joi.string().uuid())
        .error(() => new InvalidIdError()),
      serviceId: Joi.string()
        .uuid()
        .error(() => new InvalidIdError()),
      name: Joi.string()
        .min(2)
        .error(() => new InvalidNameError()),
      description: Joi.string()
        .allow('')
        .error(() => new InvalidDescriptionError()),
      priority: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .error(() => new InvalidPriorityError()),
      code: Joi.string()
        .min(2)
        .error(() => new InvalidCodeError()),
    });

    const validation = schema.validate({
      id: userId,
      organizationId,
      queueId,
      groupIds,
      serviceId,
      name,
      description,
      code,
      priority,
    });
    if (validation.error) return left(validation.error);

    return right();
  }
}
