import { Controller, Get, Param, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FindOneOrAllServicesUsecase } from '../../../../interactors/usecases/FindOneOrAllServicesUsecase';
import { Service } from '../../dto/_shared';
import { toPresentationError } from '../../errors';

@Controller({ path: 'services', version: '1' })
export class ServiceController {
  constructor(
    private readonly findOneOrAllServicesUsecase: FindOneOrAllServicesUsecase,
  ) {}

  @Version(['1'])
  @Get('organizations/:id')
  @ApiResponse({ type: [Service] })
  async getOne(@Param('id') id: string): Promise<Service[]> {
    const result = await this.findOneOrAllServicesUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedServices: Service[] = result.value.map((service) => {
      return {
        id: service.id,
        name: service.name,
        subscriptionToken: service.subscriptionToken,
        guestEnroll: service.guestEnrollment,
        organizationId: service.organizationId,
        opensAt: service.opensAt,
        closesAt: service.closesAt,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    });
    return mappedServices;
  }
}
