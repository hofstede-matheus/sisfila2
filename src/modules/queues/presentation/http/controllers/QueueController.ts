import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateQueueUsecase } from '../../../interactors/usecases/CreateQueueUsecase';
import { FindOneOrAllQueuesUsecase } from '../../../interactors/usecases/FindOneOrAllQueuesUsecase';
import { AttachGroupsToQueueUsecase } from '../../../interactors/usecases/AttachGroupsToQueueUsecase';

import { Queue } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { Request } from 'express';
import { AttachGroupsToQueueRequest } from '../dto/AttachGroupsToQueue';
import { FindQueueByIdUsecase } from '../../../interactors/usecases/FindQueueByIdUsecase';
import { GetClientPositionInQueueResponse } from '../dto/GetClientPositionInQueue';
import { GetClientPositionInQueueUsecase } from '../../../interactors/usecases/GetClientPositionInQueueUsecase';
import { CreateQueueRequest } from '../dto/CreateQueue';

@Controller({ path: 'queues', version: '1' })
export class QueueController {
  constructor(
    private readonly findOneOrAllQueuesUsecase: FindOneOrAllQueuesUsecase,
    private readonly findQueueByIdUsecase: FindQueueByIdUsecase,
    private readonly createQueueUsecase: CreateQueueUsecase,
    private readonly attachGroupsToQueueUsecase: AttachGroupsToQueueUsecase,
    private readonly getClientPositionInQueueUsecase: GetClientPositionInQueueUsecase,
  ) {}

  @Get('organizations/:id')
  @ApiResponse({ type: [Queue] })
  @ApiBearerAuth()
  async getByOrganizationId(@Param('id') id: string): Promise<Queue[]> {
    const result = await this.findOneOrAllQueuesUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedQueues: Queue[] = result.value.map((queue) => {
      return {
        id: queue.id,
        name: queue.name,
        organizationId: queue.organizationId,
        serviceId: queue.serviceId,
        code: queue.code,
        description: queue.description,
        priority: queue.priority,
        createdAt: queue.createdAt,
        updatedAt: queue.updatedAt,
        clients: queue.clientsInQueue?.map((client) => {
          return {
            id: client.id,
            name: client.name,
            organizationId: client.organizationId,
            registrationId: client.registrationId,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
          };
        }),
        lastClientCalled: queue.lastClientCalled,
        groups: queue.groups,
      };
    });
    return mappedQueues;
  }

  @Get(':queueId/position/:registrationId')
  @ApiResponse({ type: Number })
  async getClientPositionInQueue(
    @Param('queueId') queueId: string,
    @Param('registrationId') registrationId: string,
  ): Promise<GetClientPositionInQueueResponse> {
    const result = await this.getClientPositionInQueueUsecase.execute(
      queueId,
      registrationId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);
    return {
      position: result.value,
    };
  }

  @Get(':queueId')
  @ApiResponse({ type: Queue })
  async getOne(@Param('queueId') queueId: string): Promise<Queue> {
    const result = await this.findQueueByIdUsecase.execute(queueId);

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      serviceId: result.value.serviceId,
      code: result.value.code,
      description: result.value.description,
      priority: result.value.priority,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
      clients: result.value.clientsInQueue.map((client) => {
        return {
          id: client.id,
          name: client.name,
          organizationId: client.organizationId,
          registrationId: client.registrationId,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        };
      }),
      lastClientCalled: result.value.lastClientCalled,
      groups: result.value.groups,
    };
  }

  @Post()
  @ApiResponse({ type: Queue })
  @ApiBearerAuth()
  async create(
    @Body() body: CreateQueueRequest,
    @Req() request: Request,
  ): Promise<Queue> {
    const userId = request.user.sub;

    const result = await this.createQueueUsecase.execute(
      userId,
      body.name,
      body.priority,
      body.code,
      body.organizationId,
      body.serviceId,
      body.description,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      serviceId: result.value.serviceId,
      code: result.value.code,
      description: result.value.description,
      priority: result.value.priority,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
      clients: [],
      lastClientCalled: undefined,
      groups: result.value.groups,
    };
  }

  @Patch(':queueId/organizations/:organizationId')
  @HttpCode(200)
  @ApiBearerAuth()
  async attachGroupsToQueue(
    @Param('queueId') queueId: string,
    @Param('organizationId') organizationId: string,
    @Body() body: AttachGroupsToQueueRequest,
    @Req() request: Request,
  ): Promise<void> {
    const userId = request.user.sub;

    const result = await this.attachGroupsToQueueUsecase.execute(
      userId,
      organizationId,
      queueId,
      body.groups,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }
}
