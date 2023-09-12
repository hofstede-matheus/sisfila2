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
import { FindOneOrAllDesksUsecase } from '../../../interactors/usecases/FindOneOrAllDesksUsecase';
import { Desk } from '../../../../common/presentation/http/dto/_shared';
import { RemoveDeskUsecase } from '../../../interactors/usecases/RemoveDeskUsecase';
import { UpdateDeskRequest, UpdateDeskResponse } from '../dto/UpdateDesk';
import { UpdateDeskUsecase } from '../../../interactors/usecases/UpdateDeskUsecase';
import { CallNextOnDeskResponse } from '../dto/CallNextOnDesk';
import { CallNextClientOfDeskUsecase } from '../../../interactors/usecases/CallNextClientOfDeskUsecase';
import { Request } from 'express';

@Controller({ path: 'desks', version: '1' })
export class DeskController {
  constructor(
    private readonly createDeskUsecase: CreateDeskUsecase,
    private readonly findOneOrAllDesksUsecase: FindOneOrAllDesksUsecase,
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
    const result = await this.findOneOrAllDesksUsecase.execute({
      organizationId,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedDesks: Desk[] = result.value.map((desk) => {
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
          opensAt: service.opensAt,
          closesAt: service.closesAt,

          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        })),

        createdAt: desk.createdAt,
        updatedAt: desk.updatedAt,
      };
    });
    return mappedDesks;
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

    // return called client
    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      registrationId: result.value.registrationId,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }
}
