import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { toPresentationError } from '../../../../../common/presentation/http/errors';
import { CreateClientUsecase } from '../../../../interactors/usecases/CreateClientUsecase';
import {
  CreateClientRequest,
  CreateClientResponse,
} from '../../dto/CreateClient';
import { Client } from '../../../../../common/presentation/http/dto/_shared';
import { FindOneOrAllClientsUsecase } from '../../../../interactors/usecases/FindOneOrAllClientsUsecase';
import { Request } from 'express';
import { RemoveClientUsecase } from '../../../../interactors/usecases/RemoveClientUsecase';

@Controller({ path: 'clients', version: '1' })
export class ClientController {
  constructor(
    private readonly createClientUsecase: CreateClientUsecase,
    private readonly findOneOrAllClientsUsecase: FindOneOrAllClientsUsecase,
    private readonly removeClientUsecase: RemoveClientUsecase,
  ) {}

  @Post()
  @ApiResponse({ type: CreateClientResponse })
  async createUser(
    @Body() body: CreateClientRequest,
  ): Promise<CreateClientResponse> {
    const result = await this.createClientUsecase.execute(
      body.name,
      body.organizationId,
      body.registrationId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return { id: result.value };
  }

  @Get(':clientId/organizations/:organizationId')
  @ApiResponse({ type: Client })
  async getOneByUser(
    @Param('clientId') clientId: string,
    @Param('organizationId') organizationId: string,
    @Req() request: Request,
  ): Promise<Client> {
    const result = await this.findOneOrAllClientsUsecase.execute({
      organizationId,
      clientId,
      userId: request.user.sub,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value[0].id,
      name: result.value[0].name,
      createdAt: result.value[0].createdAt,
      updatedAt: result.value[0].updatedAt,
      organizationId: result.value[0].organizationId,
      registrationId: result.value[0].registrationId,
    };
  }

  @Get(':clientId')
  @ApiResponse({ type: Client })
  async getOneByAdmin(
    @Param('clientId') clientId: string,
    @Req() request: Request,
  ): Promise<Client> {
    const result = await this.findOneOrAllClientsUsecase.execute({
      clientId,
      userId: request.user.sub,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value[0].id,
      name: result.value[0].name,
      createdAt: result.value[0].createdAt,
      updatedAt: result.value[0].updatedAt,
      organizationId: result.value[0].organizationId,
      registrationId: result.value[0].registrationId,
    };
  }

  @Get('organizations/:organizationId')
  @ApiResponse({ type: [Client] })
  async getAll(
    @Param('organizationId') organizationId: string,
    @Req() request: Request,
  ): Promise<Client[]> {
    const result = await this.findOneOrAllClientsUsecase.execute({
      organizationId,
      userId: request.user.sub,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    const clients: Client[] = result.value.map((client) => ({
      id: client.id,
      name: client.name,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      organizationId: client.organizationId,
      registrationId: client.registrationId,
    }));

    return clients;
  }

  @Delete(':clientId/organizations/:organizationId')
  async remove(
    @Param('clientId') clientId: string,
    @Param('organizationId') organizationId: string,
    @Req() request: Request,
  ): Promise<void> {
    const result = await this.removeClientUsecase.execute({
      organizationId,
      clientId,
      userId: request.user.sub,
    });

    if (result.isLeft()) throw toPresentationError(result.value);
  }
}
