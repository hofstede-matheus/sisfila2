import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FindOneOrAllServicesUsecase } from '../../../interactors/usecases/FindOneOrAllServicesUsecase';
import { Service } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { CreateServiceUsecase } from '../../../interactors/usecases/CreateServiceUsecase';
import { EnterServiceRequest, EnterServiceResponse } from '../dto/EnterService';
import { AttachClientToServiceUsecase } from '../../../interactors/usecases/AttachClientToServiceUsecase';

@Controller({ path: 'services', version: '1' })
export class ServiceController {
  constructor(
    private readonly findOneOrAllServicesUsecase: FindOneOrAllServicesUsecase,
    private readonly createServiceUsecase: CreateServiceUsecase,
    private readonly attachClientToServiceUsecase: AttachClientToServiceUsecase,
  ) {}

  @Get('organizations/:id')
  @ApiResponse({ type: [Service] })
  async getAllFromOrganization(@Param('id') id: string): Promise<Service[]> {
    const result = await this.findOneOrAllServicesUsecase.execute(id, false);

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedServices: Service[] = result.value.map((service) => {
      return {
        id: service.id,
        name: service.name,
        subscriptionToken: service.subscriptionToken,
        guestEnroll: service.guestEnrollment,
        organizationId: service.organizationId,
        isOpened: service.isOpened,
        opensAt: service.opensAt,
        closesAt: service.closesAt,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    });
    return mappedServices;
  }

  @Patch('enter')
  @ApiResponse({ type: EnterServiceResponse })
  async enterService(
    @Body() body: EnterServiceRequest,
  ): Promise<EnterServiceResponse> {
    const result = await this.attachClientToServiceUsecase.execute(
      body.registrationId,
      body.organizationId,
      body.serviceId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      queueId: result.value.queueId,
      queueName: result.value.queueName,
      position: result.value.position,
    };
  }
}
