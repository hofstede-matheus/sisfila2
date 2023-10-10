import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeskEntity } from '../../../domain/entities/Desk.entity';
import { DeskRepository } from '../../../domain/repositories/DeskRepository';
import { Desk } from '../entities/desks.typeorm-entity';
import { ServiceEntity } from '../../../../services/domain/entities/Service.entity';
import { isServiceOpen } from '../../../../common/shared/helpers/moment';
import { QueueRepository } from '../../../../queues/domain/repositories/QueueRepository';
import { Inject } from '@nestjs/common';
import { ClientInQueue } from '../../../../queues/domain/entities/Queue.entity';

export class TypeOrmDesksRepository implements DeskRepository {
  constructor(
    @InjectRepository(Desk)
    private readonly desksRepository: Repository<Desk>,

    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
  ) {}

  async getLastClientCalledFromDesk(deskId: string): Promise<ClientInQueue> {
    const servicesFromDesk = await this.desksRepository.query(
      `
      SELECT services.id as service_id
      FROM desks
      LEFT JOIN desks_has_services dhs ON dhs.desk_id = desks.id
      LEFT JOIN services ON services.id = dhs.service_id
      WHERE desks.id = $1
    `,
      [deskId],
    );

    const queuesThatBelongsToServices = await this.desksRepository.query(
      `
      SELECT queues.id as queue_id
      FROM queues
      WHERE queues.service_id = ANY($1)
    `,
      [servicesFromDesk.map((service) => service.service_id)],
    );

    const lastClientCalled = await this.desksRepository.query(
      `
      SELECT 
        clients.id, 
        clients.name, 
        clients.organization_id, 
        clients.registration_id,
        clients_position_in_queues.called_at,
        clients_position_in_queues.attended_by_user,
        clients.created_at, 
        clients.updated_at
      FROM clients
      INNER JOIN clients_position_in_queues ON clients.id = clients_position_in_queues.client_id
      WHERE clients_position_in_queues.queue_id = ANY($1)
      AND clients_position_in_queues.called_at IS NOT NULL
      ORDER BY clients_position_in_queues.called_at DESC
      LIMIT 1
      `,
      [queuesThatBelongsToServices.map((queue) => queue.queue_id)],
    );

    if (lastClientCalled.length === 0) return undefined;

    return {
      id: lastClientCalled[0].id,
      name: lastClientCalled[0].name,
      organizationId: lastClientCalled[0].organization_id,
      registrationId: lastClientCalled[0].registration_id,
      calledDate: lastClientCalled[0].called_at,
      attendedByUserId: lastClientCalled[0].attended_by_user,
      createdAt: lastClientCalled[0].created_at,
      updatedAt: lastClientCalled[0].updated_at,
    };
  }

  async findById(id: string): Promise<DeskEntity> {
    const desksWithServicesByOrganizationId = await this.desksRepository.query(
      `
      SELECT desks.id, desks.name, desks.organization_id, desks.attendant_id, desks.created_at, desks.updated_at, services.id as service_id, services.name as service_name, services.organization_id as service_organization_id, services.guest_enroll as service_guest_enroll, services.opens_at as service_opens_at, services.closes_at as service_closes_at, services.created_at as service_created_at, services.updated_at as service_updated_at
      FROM desks
      LEFT JOIN desks_has_services dhs ON dhs.desk_id = desks.id
      LEFT JOIN services ON services.id = dhs.service_id
      WHERE desks.id = $1
    `,
      [id],
    );

    const desk = mapDesksWithServices(desksWithServicesByOrganizationId)[0];

    if (desk) {
      const services = await Promise.all(
        desk.services.map(async (service) => {
          const queues = await this.queueRepository.findByServiceId(service.id);
          return {
            ...service,
            queues,
          };
        }),
      );

      return {
        ...desk,
        services,
      };
    }
  }

  async update(
    id: string,
    name?: string,
    attendantId?: string,
    services?: string[],
  ): Promise<DeskEntity> {
    await this.desksRepository.update({ id }, { name, attendantId });

    if (services) {
      // delete all services from desk using query
      await this.desksRepository.query(
        `
      DELETE FROM desks_has_services
      WHERE desk_id = $1
    `,
        [id],
      );

      // insert all services to desk using query
      for (const serviceId of services) {
        await this.desksRepository.query(
          `
        INSERT INTO desks_has_services (desk_id, service_id)
        VALUES ($1, $2)
      `,
          [id, serviceId],
        );
      }
    }

    // get desk with services
    const deskWithServices = await this.desksRepository.query(
      `
      SELECT desks.id, desks.name, desks.organization_id, desks.attendant_id, desks.created_at, desks.updated_at, services.id as service_id, services.name as service_name, services.organization_id as service_organization_id, services.guest_enroll as service_guest_enroll, services.opens_at as service_opens_at, services.closes_at as service_closes_at, services.created_at as service_created_at, services.updated_at as service_updated_at
      FROM desks
      LEFT JOIN desks_has_services dhs ON dhs.desk_id = desks.id
      LEFT JOIN services ON services.id = dhs.service_id
      WHERE desks.id = $1
    `,
      [id],
    );

    return mapDesksWithServices(deskWithServices)[0];
  }

  async removeFromOrganization(id: string): Promise<void> {
    // delete where id = id and organization_id = organization_id
    await this.desksRepository.delete({ id });
  }

  async findAllByOrganizationId(organizationId: string): Promise<DeskEntity[]> {
    const desksWithServicesByOrganizationId = await this.desksRepository.query(
      `
      SELECT desks.id, desks.name, desks.organization_id, desks.attendant_id, desks.created_at, desks.updated_at, services.id as service_id, services.name as service_name, services.organization_id as service_organization_id, services.guest_enroll as service_guest_enroll, services.opens_at as service_opens_at, services.closes_at as service_closes_at, services.created_at as service_created_at, services.updated_at as service_updated_at
      FROM desks
      LEFT JOIN desks_has_services dhs ON dhs.desk_id = desks.id
      LEFT JOIN services ON services.id = dhs.service_id
      WHERE desks.organization_id = $1
    `,
      [organizationId],
    );

    return mapDesksWithServices(desksWithServicesByOrganizationId);
  }

  async create(name: string, organizationId: string): Promise<DeskEntity> {
    const newDesk = this.desksRepository.create({ name, organizationId });

    await this.desksRepository.save(newDesk);
    return {
      id: newDesk.id,
      name: newDesk.name,
      organizationId: newDesk.organizationId,
      attendantId: newDesk.attendantId,
      services: [],
      createdAt: newDesk.createdAt,
      updatedAt: newDesk.updatedAt,
    };
  }
}

export function mapDesksWithServices(data: any[]): DeskEntity[] {
  const desksMap = new Map<string, DeskEntity>();

  data.forEach((row) => {
    const {
      id,
      name,
      organization_id,
      attendant_id,
      created_at,
      updated_at,
      service_id,
      service_name,
      service_organization_id,
      service_guest_enroll,
      service_opens_at,
      service_closes_at,
      service_created_at,
      service_updated_at,
    } = row;

    if (!desksMap.has(id)) {
      desksMap.set(id, {
        id,
        name,
        organizationId: organization_id,
        attendantId: attendant_id,
        services: [],
        createdAt: created_at,
        updatedAt: updated_at,
      });
    }

    if (!service_id) return;

    const service: ServiceEntity = {
      id: service_id,
      name: service_name,
      organizationId: service_organization_id,
      isOpened: isServiceOpen(service_opens_at, service_closes_at),
      guestEnrollment: service_guest_enroll,
      opensAt: service_opens_at,
      closesAt: service_closes_at,
      createdAt: service_created_at,
      updatedAt: service_updated_at,
    };

    const desk = desksMap.get(id);
    desk.services.push(service);
  });

  return Array.from(desksMap.values());
}
