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
import { ApiResponse } from '@nestjs/swagger';
import { CreateQueueUsecase } from '../../../../interactors/usecases/CreateQueueUsecase';
import { FindOneOrAllQueuesUsecase } from '../../../../interactors/usecases/FindOneOrAllQueuesUsecase';
import { AttachGroupsToQueueUsecase } from '../../../../interactors/usecases/AttachGroupsToQueueUsecase';

import { CreateQueueRequest, CreateQueueResponse } from '../../dto/CreateQueue';
import { Queue } from '../../dto/_shared';
import { toPresentationError } from '../../errors';
import { Request } from 'express';
import { AttachGroupsToQueueRequest } from '../../dto/AttachGroupsToQueue';
import { EnterQueueRequest } from '../../dto/EnterQueue';
import { AttachClientToQueueUsecase } from '../../../../interactors/usecases/AttachClientToQueueUsecase';
import { FindQueueByIdUsecase } from '../../../../interactors/usecases/FindQueueByIdUsecase';
import { CallNextClientOfQueueUsecase } from '../../../../interactors/usecases/CallNextClientOfQueueUsecase';
import { CallNextOnQueueRequest } from '../../dto/CallNextOnQueue';

@Controller({ path: 'queues', version: '1' })
export class QueueController {
  constructor(
    private readonly findOneOrAllQueuesUsecase: FindOneOrAllQueuesUsecase,
    private readonly findQueueByIdUsecase: FindQueueByIdUsecase,
    private readonly createQueueUsecase: CreateQueueUsecase,
    private readonly attachGroupsToQueueUsecase: AttachGroupsToQueueUsecase,
    private readonly attachClientToQueueUsecase: AttachClientToQueueUsecase,
    private readonly callNextClientOfQueueUsecase: CallNextClientOfQueueUsecase,
  ) {}

  @Get('organizations/:id')
  @ApiResponse({ type: [Queue] })
  async getOne(@Param('id') id: string): Promise<Queue[]> {
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
      };
    });
    return mappedQueues;
  }

  @Get(':queueId')
  @ApiResponse({ type: Queue })
  async getQueue(@Param('queueId') queueId: string): Promise<Queue> {
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
    };
  }

  @Post()
  @ApiResponse({ type: CreateQueueResponse })
  async create(
    @Body() body: CreateQueueRequest,
    @Req() request: Request,
  ): Promise<CreateQueueResponse> {
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

    return { id: result.value };
  }

  @Patch(':queueId/organizations/:organizationId')
  @HttpCode(200)
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

  @Patch('enter')
  async enterQueue(@Body() body: EnterQueueRequest): Promise<void> {
    const result = await this.attachClientToQueueUsecase.execute(
      body.registrationId,
      body.organizationId,
      body.queueId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);
  }

  @Patch('next')
  async callNextClientOfQueue(
    @Body() body: CallNextOnQueueRequest,
  ): Promise<void> {
    const result = await this.callNextClientOfQueueUsecase.execute(
      body.organizationId,
      body.queueId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);
  }
}
