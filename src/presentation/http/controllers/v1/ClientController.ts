import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { toPresentationError } from '../../errors';
import { CreateClientUsecase } from '../../../../interactors/usecases/CreateClientUsecase';
import {
  CreateClientRequest,
  CreateClientResponse,
} from '../../dto/CreateClient';
import { Client } from '../../dto/_shared';
import { FindOneOrAllClientsUsecase } from '../../../../interactors/usecases/FindOneOrAllClientsUsecase';
import { Request } from 'express';

@Controller({ path: 'clients', version: '1' })
export class ClientController {
  constructor(
    private readonly createClientUsecase: CreateClientUsecase,
    private readonly findOneOrAllClientsUsecase: FindOneOrAllClientsUsecase,
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

  @Get(':clientId')
  @ApiResponse({ type: Client })
  async getOnByAdmin(
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

  @Get(':clientId/organizations/:organizationId')
  @ApiResponse({ type: Client })
  async getOne(
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
}
