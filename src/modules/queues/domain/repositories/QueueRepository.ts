import { Either } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { PositionInQueueWithDesk, QueueEntity } from '../entities/Queue.entity';

export interface QueueRepository {
  findByServiceId(serviceId: string): Promise<QueueEntity[] | undefined>;
  findByOrganizationId(organizationId: string): Promise<QueueEntity[]>;
  findById(queueId: string): Promise<QueueEntity>;
  create(
    name: string,
    code: string,
    organizationId: string,
    serviceId: string,
    description?: string,
  ): Promise<QueueEntity>;
  attachGroupsToQueue(groupIds: string[], queueId: string): Promise<void>;
  attachServiceToQueue(serviceId: string, queueId: string): Promise<void>;
  attachClientToQueue(userId: string, queueId: string): Promise<void>;
  // callNextClient(queueId: string): Promise<void>;
  callClient(
    callerId: string,
    queueId: string,
    clientId: string,
    deskId: string,
  ): Promise<void>;
  getPositionOfClient(
    queueId: string,
    clientId: string,
  ): Promise<PositionInQueueWithDesk>;
  attachClientToQueueByServiceIdOrganizationIdRegistrationId(
    serviceId: string,
    organizationId: string,
    userId: string,
  ): Promise<
    Either<
      DomainError,
      {
        queueId: string;
        queueName: string;
        position: number;
      }
    >
  >;
  update(
    queueId: string,
    name?: string,
    description?: string,
    code?: string,
    priority?: number,
  ): Promise<QueueEntity>;
  remove(queueId: string): Promise<void>;
  selectBestQueueForClient(
    serviceId: string,
    organizationId: string,
    userId: string,
  ): Promise<QueueEntity>;
  setPriority(queueId: string): Promise<void>;
}

export const QueueRepository = Symbol('QueueRepository');
