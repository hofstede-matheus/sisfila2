import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiResponse } from '@nestjs/swagger';
import { FindOneOrAllServicesUsecase } from '../../../../interactors/usecases/FindOneOrAllServicesUsecase';
import { CreateGroupResponse } from '../../dto/CreateGroup';
import {
  CreateServiceRequest,
  CreateServiceResponse,
} from '../../dto/CreateService';
import { Service } from '../../dto/_shared';
import { toPresentationError } from '../../errors';
import { CreateServiceUsecase } from '../../../../interactors/usecases/CreateServiceUsecase';

@Controller({ path: 'services', version: '1' })
export class ServiceController {
  constructor(
    private readonly findOneOrAllServicesUsecase: FindOneOrAllServicesUsecase,
    private readonly createServiceUsecase: CreateServiceUsecase,
  ) {}

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

  @Post()
  @ApiResponse({ type: CreateServiceResponse })
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

    return { id: result.value };
  }
}
