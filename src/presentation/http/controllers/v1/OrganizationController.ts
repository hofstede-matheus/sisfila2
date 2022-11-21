import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { Request } from 'express';
import { CreateOrganizationUsecase } from '../../../../interactors/usecases/CreateOrganizationUsecase';
import { FindOneOrAllOrganizationsUsecase } from '../../../../interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { RemoveOrganizationUsecase } from '../../../../interactors/usecases/RemoveOrganizationUsecase';
import { UpdateOrganizationUsecase } from '../../../../interactors/usecases/UpdateOrganizationUsecase';
import {
  CreateOrganizationResponse,
  CreateOrganizationRequest,
} from '../../dto/CreateOrganization';
import { UpdateOrganizationRequest } from '../../dto/UpdateOrganization';
import { Organization } from '../../dto/_shared';
import { toPresentationError } from '../../errors';

@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(
    private readonly createOrganizationUsecase: CreateOrganizationUsecase,
    private readonly updateOrganizationUsecase: UpdateOrganizationUsecase,
    private readonly findOneOrAllOrganizationsUsecase: FindOneOrAllOrganizationsUsecase,
    private readonly removeOrganizationUsecase: RemoveOrganizationUsecase,
  ) {}

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

  @Put()
  async updateUser(@Body() body: UpdateOrganizationRequest): Promise<void> {
    const result = await this.updateOrganizationUsecase.execute(
      body.id,
      body.name,
      body.code,
    );

    if (result.isLeft()) throw toPresentationError(result.value);
  }

  @Get(':id')
  @ApiResponse({ type: Organization })
  async getOne(@Param('id') id: string): Promise<Organization> {
    const result = await this.findOneOrAllOrganizationsUsecase.execute({
      organizationId: id,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value[0].id,
      name: result.value[0].name,
      code: result.value[0].code,
      createdAt: result.value[0].createdAt,
      updatedAt: result.value[0].updatedAt,
    };
  }

  @Get()
  @ApiResponse({ type: [Organization] })
  async getAll(@Req() request: Request): Promise<Organization[]> {
    const result = await this.findOneOrAllOrganizationsUsecase.execute({
      userId: request.user.sub,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    const organizations = result.value.map((organization) => ({
      id: organization.id,
      name: organization.name,
      code: organization.code,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    }));

    return organizations;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.removeOrganizationUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);
  }
}
