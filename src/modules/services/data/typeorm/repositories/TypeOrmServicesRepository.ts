import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '../../../domain/entities/Service.entity';
import { ServiceRepository } from '../../../domain/repositories/ServiceRepository';
import { Service } from '../entities/services.typeorm-entity';
import { isServiceOpen } from '../../../../common/shared/helpers/moment';

export class TypeOrmServicesRepository implements ServiceRepository {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async update(
    id: string,
    name?: string,
    subscriptionToken?: string,
    guestEnrollment?: boolean,
    opensAt?: Date,
    closesAt?: Date,
    mapOfQueueIdsIndexedByPosition?: Map<number, string>,
  ): Promise<ServiceEntity> {
    // const updatedService = await this.servicesRepository.save({
    //   id,
    //   name,
    //   subscription_token: subscriptionToken,
    //   guest_enroll: guestEnrollment,
    //   opensAt: opensAt,
    //   closesAt: closesAt,
    // });

    // update instead of save
    await this.servicesRepository.update(id, {
      name,
      subscription_token: subscriptionToken,
      guest_enroll: guestEnrollment,
      opensAt: opensAt,
      closesAt: closesAt,
    });

    for (const [position, queueId] of mapOfQueueIdsIndexedByPosition) {
      // await this.servicesRepository.query(
      //   `
      //   UPDATE queues
      //   SET service_id = NULL
      //   WHERE id = $1
      // `,
      //   [queueId],
      // );

      await this.servicesRepository.query(
        `
        UPDATE queues
        SET service_id = $1, priority = $2
        WHERE id = $3
      `,
        [id, position + 1, queueId],
      );
    }

    const updatedService = await this.findById(id);

    return {
      id: updatedService.id,
      name: updatedService.name,
      subscriptionToken: updatedService.subscriptionToken,
      guestEnrollment: updatedService.guestEnrollment,
      opensAt: updatedService.opensAt,
      closesAt: updatedService.closesAt,
      organizationId: updatedService.organizationId,
      createdAt: updatedService.createdAt,
      updatedAt: updatedService.updatedAt,
      isOpened: isServiceOpen(opensAt, closesAt),
    };
  }

  async remove(serviceId: string): Promise<void> {
    await this.servicesRepository.delete(serviceId);
  }

  async findByDeskId(deskId: string): Promise<ServiceEntity[]> {
    const services = await this.servicesRepository.query(
      `
      SELECT s.id, s.name, s.subscription_token, s.guest_enroll, s.opens_at, s.closes_at, s.organization_id, s.created_at, s.updated_at
      FROM desks d
      INNER JOIN desks_has_services dhs ON d.id = dhs.desk_id
      INNER JOIN services s ON dhs.service_id = s.id
      WHERE d.id = $1
    `,
      [deskId],
    );

    return services.map((service) => {
      return {
        id: service.id,
        name: service.name,
        subscriptionToken: service.subscription_token,
        guestEnrollment: service.guest_enroll,
        opensAt: service.opens_at,
        closesAt: service.closes_at,
        organizationId: service.organization_id,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      };
    });
  }

  async create(
    name: string,
    guestEnrollment: boolean,
    opensAt: Date,
    closesAt: Date,
    organizationId: string,
    subscriptionToken: string,
  ): Promise<ServiceEntity> {
    const serviceEntity = this.servicesRepository.create({
      name,
      subscription_token: subscriptionToken,
      guest_enroll: guestEnrollment,
      opensAt: opensAt,
      closesAt: closesAt,
      organization_id: organizationId,
    });

    const serviceInDatabase = await this.servicesRepository.save(serviceEntity);

    return {
      id: serviceInDatabase.id,
      name: serviceInDatabase.name,
      subscriptionToken: serviceInDatabase.subscription_token,
      guestEnrollment: serviceInDatabase.guest_enroll,
      opensAt: serviceInDatabase.opensAt,
      closesAt: serviceInDatabase.closesAt,
      organizationId: serviceInDatabase.organization_id,
      createdAt: serviceInDatabase.createdAt,
      updatedAt: serviceInDatabase.updatedAt,
      isOpened: isServiceOpen(opensAt, closesAt),
    };
  }

  async findByOrganizationId(
    organizationId: string,
    listServicesWithNoQueue: boolean,
  ): Promise<ServiceEntity[]> {
    // TODO: Test when service has more than one queue
    if (listServicesWithNoQueue) {
      const services = await this.servicesRepository.find({
        where: { organization_id: organizationId },
      });

      return services.map((service) => {
        return {
          id: service.id,
          name: service.name,
          subscriptionToken: service.subscription_token,
          guestEnrollment: service.guest_enroll,
          opensAt: service.opensAt,
          closesAt: service.closesAt,
          organizationId: service.organization_id,
          isOpened: isServiceOpen(service.opensAt, service.closesAt),
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        } as ServiceEntity;
      });
    } else {
      const services = await this.servicesRepository.query(
        `
      SELECT s.id, s.name, s.subscription_token, s.guest_enroll, s.opens_at, s.closes_at, s.organization_id, s.created_at, s.updated_at
      FROM services s
      INNER JOIN queues q ON s.id = q.service_id
      WHERE s.organization_id = $1
      GROUP BY s.id
    `,
        [organizationId],
      );
      return services.map((service) => {
        return {
          id: service.id,
          name: service.name,
          subscriptionToken: service.subscription_token,
          guestEnrollment: service.guest_enroll,
          opensAt: service.opens_at,
          closesAt: service.opens_at,
          organizationId: service.organization_id,
          isOpened: isServiceOpen(service.opens_at, service.opens_at),
          createdAt: service.created_at,
          updatedAt: service.updated_at,
        } as ServiceEntity;
      });
    }
  }

  async findById(serviceId: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    const queuesFromService = await this.servicesRepository.query(
      `
      SELECT q.id, q.name, q.service_id, q.created_at, q.updated_at
      FROM queues q
      WHERE q.service_id = $1
    `,
      [serviceId],
    );

    return {
      id: service.id,
      name: service.name,
      subscriptionToken: service.subscription_token,
      guestEnrollment: service.guest_enroll,
      opensAt: service.opensAt,
      closesAt: service.closesAt,
      organizationId: service.organization_id,
      isOpened: isServiceOpen(service.opensAt, service.closesAt),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      queues: queuesFromService.map((queue) => {
        return {
          id: queue.id,
          name: queue.name,
          serviceId: queue.service_id,
          createdAt: queue.created_at,
          updatedAt: queue.updated_at,
        };
      }),
    };
  }
}
