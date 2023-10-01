import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Delete,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FindOneOrAllServicesUsecase } from '../../../interactors/usecases/FindOneOrAllServicesUsecase';
import {
  CreateServiceRequest,
  CreateServiceResponse,
} from '../dto/CreateService';
import { Service } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { CreateServiceUsecase } from '../../../interactors/usecases/CreateServiceUsecase';
import { RemoveServiceUsecase } from '../../../interactors/usecases/RemoveServiceUsecase';
import { UpdateServiceRequest } from '../dto/UpdateService';
import { UpdateServiceUsecase } from '../../../interactors/usecases/UpdateServiceUsecase';

@Controller({ path: 'admin/services', version: '1' })
export class AdminServiceController {
  constructor(
    private readonly findOneOrAllServicesUsecase: FindOneOrAllServicesUsecase,
    private readonly createServiceUsecase: CreateServiceUsecase,
    private readonly removeServiceUsecase: RemoveServiceUsecase,
    private readonly updateServiceUsecase: UpdateServiceUsecase,
  ) {}

  @Get('organizations/:id')
  @ApiResponse({ type: [Service] })
  @ApiBearerAuth()
  async getAllFromOrganization(@Param('id') id: string): Promise<Service[]> {
    const result = await this.findOneOrAllServicesUsecase.execute(id, true);

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

  @Post()
  @ApiResponse({ type: CreateServiceResponse })
  @ApiBearerAuth()
  async create(
    @Body() body: CreateServiceRequest,
    @Req() request: Request,
  ): Promise<CreateServiceResponse> {
    const userId = request.user.sub;

    const result = await this.createServiceUsecase.execute(
      userId,
      body.name,
      body.subscriptionToken,
      body.guestEnrollment,
      body.organizationId,
      body.opensAt,
      body.closesAt,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      subscriptionToken: result.value.subscriptionToken,
      guestEnroll: result.value.guestEnrollment,
      organizationId: result.value.organizationId,
      isOpened: result.value.isOpened,
      opensAt: result.value.opensAt,
      closesAt: result.value.closesAt,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  async removeService(@Param('id') id: string): Promise<void> {
    const result = await this.removeServiceUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);
  }

  @Patch(':id')
  @ApiBearerAuth()
  async updateService(
    @Param('id') id: string,
    @Body() body: UpdateServiceRequest,
  ): Promise<CreateServiceResponse> {
    const result = await this.updateServiceUsecase.execute(
      id,
      body.name,
      body.subscriptionToken,
      body.guestEnrollment,
      body.opensAt,
      body.closesAt,
      body.queueIds,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      subscriptionToken: result.value.subscriptionToken,
      guestEnroll: result.value.guestEnrollment,
      organizationId: result.value.organizationId,
      isOpened: result.value.isOpened,
      opensAt: result.value.opensAt,
      closesAt: result.value.closesAt,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }
}
