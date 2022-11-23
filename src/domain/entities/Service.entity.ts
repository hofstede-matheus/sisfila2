import * as Joi from 'joi';
import { Either, left, right } from '../../shared/helpers/either';
import { staticImplements, DomainEntity } from '../../shared/helpers/entity';
import { DomainError } from '../../shared/helpers/errors';
import { InvalidNameError, InvalidDateError } from '../errors';

export interface ServiceEntity {
  readonly id: string;

  readonly subscriptionToken?: string;
  readonly name: string;
  readonly guestEnrollment: boolean;
  readonly opensAt: Date;
  readonly closesAt: Date;
  readonly organizationId: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

@staticImplements<DomainEntity<ServiceEntity>>()
export class ServiceEntity {
  private constructor(
    readonly name: string,
    readonly guestEnrollment: boolean,
    readonly opensAt: Date,
    readonly closesAt: Date,
  ) {}

  public static build(
    name: string,
    guest_enrollment: boolean,
    opens_at: Date,
    closes_at: Date,
  ): Either<DomainError, ServiceEntity> {
    if (guest_enrollment !== true) guest_enrollment = false;
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .required()
        .error(() => new InvalidNameError()),
      opens_at: Joi.date()
        .required()
        .error(() => new InvalidDateError()),
      closes_at: Joi.date()
        .required()
        .error(() => new InvalidDateError()),
    });

    const validation = schema.validate({ name, opens_at, closes_at });
    if (validation.error) return left(validation.error);

    return right(
      new ServiceEntity(name, guest_enrollment, opens_at, closes_at),
    );
  }
}
