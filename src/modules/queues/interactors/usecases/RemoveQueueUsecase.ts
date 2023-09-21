import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { UserNotFromOrganizationError } from '../../../common/domain/errors';
import { OrganizationRepository } from '../../../organizations/domain/repositories/OrganizationRepository';

@Injectable()
export class RemoveQueueUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    id: string, 
    userId: string,
    organizationId: string,
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [id],
    });

    if (validation.isLeft()) return left(validation.value);

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        userId,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    this.queueRepository.remove(id);
    return right();
  }
}
