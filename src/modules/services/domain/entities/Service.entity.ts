import * as Joi from 'joi';
import { Either, left, right } from '../../../common/shared/helpers/either';
import {
  staticImplements,
  DomainEntity,
} from '../../../common/shared/helpers/entity';
import { DomainError } from '../../../common/shared/helpers/errors';
import {
  InvalidNameError,
  InvalidDateError,
  InvalidIdError,
  GuestEnrollmentError,
} from '../../../common/domain/errors';

export interface ServiceEntity {
  readonly id: string;

  readonly subscriptionToken?: string;
  readonly name: string;
  readonly guestEnrollment: boolean;
  readonly opensAt: Date;
  readonly closesAt: Date;
  readonly organizationId: string;
  readonly isOpened: boolean;

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
    // TODO: Remove POG
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

  public static validateEdit(
    id: string,
    name: string,
    guest_enrollment: boolean,
    opens_at: Date,
    closes_at: Date,
  ): Either<DomainError, void> {
    const schema = Joi.object({
      id: Joi.string()
        .uuid()
        .required()
        .error(() => new InvalidIdError()),
      name: Joi.string()
        .min(2)
        .error(() => new InvalidNameError()),
      opens_at: Joi.date().error(() => new InvalidDateError()),
      closes_at: Joi.date().error(() => new InvalidDateError()),
      guest_enrollment: Joi.boolean().error(() => new GuestEnrollmentError()),
    });

    const validation = schema.validate({
      id,
      name,
      guest_enrollment,
      opens_at,
      closes_at,
    });

    if (validation.error) return left(validation.error);

    return right();
  }
}
