import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CreateDeskRequest, CreateDeskResponse } from '../dto/CreateDesk';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateDeskUsecase } from '../../../interactors/usecases/CreateDeskUsecase';
import { Desk } from '../../../../common/presentation/http/dto/_shared';
import { RemoveDeskUsecase } from '../../../interactors/usecases/RemoveDeskUsecase';
import { UpdateDeskRequest, UpdateDeskResponse } from '../dto/UpdateDesk';
import { UpdateDeskUsecase } from '../../../interactors/usecases/UpdateDeskUsecase';
import { CallNextOnDeskResponse } from '../dto/CallNextOnDesk';
import { CallNextClientOfDeskUsecase } from '../../../interactors/usecases/CallNextClientOfDeskUsecase';
import { Request } from 'express';
import {
  DeskEntity,
  DeskWithCalledClient,
} from '../../../domain/entities/Desk.entity';
import { FindAllDesksFromOrganizationUsecase } from '../../../interactors/usecases/FindAllDesksFromOrganizationUsecase';
import { FindOneDeskFromOrganizationUsecase } from '../../../interactors/usecases/FindOneDeskFromOrganizationUsecase';
import { GetDeskResponse } from '../dto/GetDesk';

@Controller({ path: 'desks', version: '1' })
export class DeskController {
  constructor(
    private readonly createDeskUsecase: CreateDeskUsecase,
    private readonly findAllDesksFromOrganizationUsecase: FindAllDesksFromOrganizationUsecase,
    private readonly findOneDeskFromOrganizationUsecase: FindOneDeskFromOrganizationUsecase,
    private readonly removeDeskUsecase: RemoveDeskUsecase,
    private readonly updateDeskUsecase: UpdateDeskUsecase,
    private readonly callNextClientOfDeskUsecase: CallNextClientOfDeskUsecase,
  ) {}

  @Post()
  @ApiResponse({ type: CreateDeskResponse })
  @ApiBearerAuth()
  async createDesk(
    @Body() body: CreateDeskRequest,
  ): Promise<CreateDeskResponse> {
    const result = await this.createDeskUsecase.execute(
      body.name,
      body.organizationId,
      body.servicesIds,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      attendantId: result.value.attendantId,
      services: result.value.services.map((service) => ({
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
      })),

      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Get('organizations/:organizationId')
  @ApiResponse({ type: [Desk] })
  @ApiBearerAuth()
  async getAllDesks(
    @Param('organizationId') organizationId: string,
  ): Promise<Desk[]> {
    const result = await this.findAllDesksFromOrganizationUsecase.execute({
      organizationId,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedDesks: Desk[] = (result.value as DeskEntity[]).map((desk) => {
      return {
        id: desk.id,
        name: desk.name,
        organizationId: desk.organizationId,
        attendantId: desk.attendantId,
        services: desk.services.map((service) => ({
          id: service.id,
          name: service.name,
          subscriptionToken: service.subscriptionToken,
          guestEnroll: service.guestEnrollment,
          organizationId: service.organizationId,
          isOpened: service.isOpened,
          opensAt: service.opensAt,
          closesAt: service.closesAt,
          queues: service.queues?.map((queue) => ({
            id: queue.id,
            name: queue.name,
            description: queue.description,
            code: queue.code,
            organizationId: queue.organizationId,
            priority: queue.priority,
            serviceId: queue.serviceId,
            createdAt: queue.createdAt,
            updatedAt: queue.updatedAt,
            clients: queue.clientsInQueue.map((client) => {
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
          })),

          createdAt: desk.createdAt,
          updatedAt: desk.updatedAt,
        })),
        createdAt: desk.createdAt,
        updatedAt: desk.updatedAt,
      };
    });
    return mappedDesks;
  }

  @Get(':deskId/organizations/:organizationId')
  @ApiResponse({ type: GetDeskResponse })
  @ApiBearerAuth()
  async getDesk(
    @Param('organizationId') organizationId: string,
    @Param('deskId') deskId: string,
  ): Promise<GetDeskResponse> {
    const result = await this.findOneDeskFromOrganizationUsecase.execute({
      organizationId,
      id: deskId,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      lastClientCalled: result.value.client ?? {
        id: result.value.client.id,
        name: result.value.client.name,
        organizationId: result.value.client.organizationId,
        registrationId: result.value.client.registrationId,
        createdAt: result.value.client.createdAt,
        updatedAt: result.value.client.updatedAt,
        calledDate: result.value.client.calledDate,
        attendedByUserId: result.value.client.attendedByUserId,
      },
      desk: {
        id: result.value.desk.id,
        name: result.value.desk.name,
        organizationId: result.value.desk.organizationId,
        attendantId: result.value.desk.attendantId,
        services: result.value.desk.services.map((service) => ({
          id: service.id,
          name: service.name,
          subscriptionToken: service.subscriptionToken,
          guestEnroll: service.guestEnrollment,
          organizationId: service.organizationId,
          isOpened: service.isOpened,
          opensAt: service.opensAt,
          closesAt: service.closesAt,
          queues: service.queues.map((queue) => ({
            id: queue.id,
            name: queue.name,
            description: queue.description,
            code: queue.code,
            organizationId: queue.organizationId,
            priority: queue.priority,
            serviceId: queue.serviceId,
            createdAt: queue.createdAt,
            updatedAt: queue.updatedAt,
            clients: queue.clientsInQueue.map((client) => {
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
          })),

          createdAt: result.value.desk.createdAt,
          updatedAt: result.value.desk.updatedAt,
        })),
        createdAt: result.value.desk.createdAt,
        updatedAt: result.value.desk.updatedAt,
      },
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  async deleteDesk(@Param('id') id: string): Promise<void> {
    const result = await this.removeDeskUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);
  }

  @Patch(':id')
  @ApiBearerAuth()
  async updateDesk(
    @Param('id') id: string,
    @Body() body: UpdateDeskRequest,
  ): Promise<UpdateDeskResponse> {
    const result = await this.updateDeskUsecase.execute(
      id,
      body.name,
      body.attendantId,
      body.services,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      attendantId: result.value.attendantId,
      services: result.value.services.map((service) => ({
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
      })),

      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Patch(':id/next')
  @ApiResponse({ type: CallNextOnDeskResponse })
  @ApiBearerAuth()
  async callNextClientOfQueue(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<CallNextOnDeskResponse> {
    const result = await this.callNextClientOfDeskUsecase.execute(
      id,
      request.user.sub,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    if (result.value === null) return null;

    return {
      client: {
        id: result.value.client.id,
        name: result.value.client.name,
        organizationId: result.value.client.organizationId,
        registrationId: result.value.client.registrationId,
        createdAt: result.value.client.createdAt,
        updatedAt: result.value.client.updatedAt,
      },
      desk: {
        id: result.value.desk.id,
        name: result.value.desk.name,
        organizationId: result.value.desk.organizationId,
        attendantId: result.value.desk.attendantId,
        services: result.value.desk.services.map((service) => ({
          id: service.id,
          name: service.name,
          subscriptionToken: service.subscriptionToken,
          guestEnroll: service.guestEnrollment,
          organizationId: service.organizationId,
          isOpened: service.isOpened,
          opensAt: service.opensAt,
          closesAt: service.closesAt,
          queues: service.queues.map((queue) => ({
            id: queue.id,
            name: queue.name,
            description: queue.description,
            code: queue.code,
            organizationId: queue.organizationId,
            priority: queue.priority,
            serviceId: queue.serviceId,
            createdAt: queue.createdAt,
            updatedAt: queue.updatedAt,
            clients: queue.clientsInQueue.map((client) => {
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
          })),

          createdAt: result.value.desk.createdAt,
          updatedAt: result.value.desk.updatedAt,
        })),
        createdAt: result.value.desk.createdAt,
        updatedAt: result.value.desk.updatedAt,
      },
    };
  }
}
