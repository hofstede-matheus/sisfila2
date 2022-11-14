import { Inject, Injectable } from '@nestjs/common';
import { ServiceEntity } from '../../domain/entities/Service.entity';
import { ServiceNotFoundError } from '../../domain/errors';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class FindOneOrAllServicesUsecase implements UseCase {
  constructor(
    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,
  ) {}
  async execute(id?: string): Promise<Either<DomainError, ServiceEntity[]>> {
    const validation = Validator.validate({ id: [id] });
    if (validation.isLeft()) return left(validation.value);

    const services = await this.serviceRepository.findByOrganizationId(id);

    if (!services) return left(new ServiceNotFoundError());
    return right(services);
  }
}
