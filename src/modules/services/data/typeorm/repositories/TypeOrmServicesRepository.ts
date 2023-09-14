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
  ): Promise<string> {
    const serviceEntity = this.servicesRepository.create({
      name,
      subscription_token: subscriptionToken,
      guest_enroll: guestEnrollment,
      opensAt: opensAt,
      closesAt: closesAt,
      organization_id: organizationId,
    });

    const serviceInDatabase = await this.servicesRepository.save(serviceEntity);

    return serviceInDatabase.id;
  }
  async findByOrganizationId(organizationId: string): Promise<ServiceEntity[]> {
    const services = await this.servicesRepository.find({
      where: { organization_id: organizationId },
    });

    const mappedServices: ServiceEntity[] = services.map((service: Service) => {
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
      };
    });

    return mappedServices;
  }

  async findById(serviceId: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

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
    };
  }
}
