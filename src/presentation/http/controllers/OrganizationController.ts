import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CreateOrganizationUsecase } from '../../../interactors/usecases/CreateOrganizationUsecase';
import {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from '../dto/CreateOrganization';
import { toPresentationError } from '../errors';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUsecase: CreateOrganizationUsecase,
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
}
