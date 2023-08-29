import * as Joi from 'joi';
import { Either, left, right } from '../../../../shared/helpers/either';
import {
  staticImplements,
  DomainEntity,
} from '../../../../shared/helpers/entity';
import { DomainError } from '../../../../shared/helpers/errors';
import {
  InvalidNameError,
  InvalidPriorityError,
  InvalidCodeError,
} from '../../../../domain/errors';

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

@staticImplements<DomainEntity<QueueEntity>>()
export class QueueEntity {
  private constructor(
    readonly name: string,
    readonly priority: number,
    readonly code: string,
    readonly description?: string,
  ) {}

  public static build(
    name: string,
    priority: number,
    code: string,
    description?: string,
  ): Either<DomainError, QueueEntity> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),
      priority: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .required()
        .error(() => new InvalidPriorityError()),
      code: Joi.string()
        .required()
        .min(2)
        .error(() => new InvalidCodeError()),
    });

    const validation = schema.validate({ name, priority, code });
    if (validation.error) return left(validation.error);

    return right(new QueueEntity(name, priority, code, description));
  }
}
