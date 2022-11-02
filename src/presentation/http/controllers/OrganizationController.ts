import { Body, Controller, Post, Put, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CreateOrganizationUsecase } from '../../../interactors/usecases/CreateOrganizationUsecase';
import { UpdateOrganizationUsecase } from '../../../interactors/usecases/UpdateOrganizationUsecase';
import {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from '../dto/CreateOrganization';
import { UpdateOrganizationRequest } from '../dto/UpdateOrganization';
import { toPresentationError } from '../errors';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUsecase: CreateOrganizationUsecase,
    private readonly updateOrganizationUsecase: UpdateOrganizationUsecase,
  ) {}

  @Version(['1'])
  @Post()
  @ApiResponse({ type: CreateOrganizationResponse })
  async createUser(
    @Body() body: CreateOrganizationRequest,
  ): Promise<CreateOrganizationResponse> {
    const result = await this.createOrganizationUsecase.execute(
      body.name,
      body.code,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return { id: result.value };
  }

  @Version(['1'])
  @Put()
  async updateUser(@Body() body: UpdateOrganizationRequest): Promise<void> {
    const result = await this.updateOrganizationUsecase.execute(
      body.id,
      body.name,
      body.code,
    );

    if (result.isLeft()) throw toPresentationError(result.value);
  }
}
