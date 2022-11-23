import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { toPresentationError } from '../../errors';
import { CreateClientUsecase } from '../../../../interactors/usecases/CreateClientUsecase';
import {
  CreateClientRequest,
  CreateClientResponse,
} from '../../dto/CreateClient';

@Controller({ path: 'clients', version: '1' })
export class ClientController {
  constructor(private readonly createClientUsecase: CreateClientUsecase) {}

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
}
