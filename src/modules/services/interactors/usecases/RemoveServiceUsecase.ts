import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { Either, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';

@Injectable()
export class RemoveServiceUsecase implements UseCase {
  constructor(
    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,
  ) {}
  async execute(id: string): Promise<Either<DomainError, void>> {
    await this.serviceRepository.remove(id);
    return right();
  }
}
