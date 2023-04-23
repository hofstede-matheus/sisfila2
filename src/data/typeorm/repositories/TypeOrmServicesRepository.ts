import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '../../../domain/entities/Service.entity';
import { ServiceRepository } from '../../../domain/repositories/ServiceRepository';
import { Service } from '../entities/services';

export class TypeOrmServicesRepository implements ServiceRepository {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}
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
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
