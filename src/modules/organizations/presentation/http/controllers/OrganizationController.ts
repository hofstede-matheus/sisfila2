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
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { Request } from 'express';
import { CreateOrganizationUsecase } from '../../../interactors/usecases/CreateOrganizationUsecase';
import { FindOneOrAllOrganizationsUsecase } from '../../../interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { RemoveOrganizationUsecase } from '../../../interactors/usecases/RemoveOrganizationUsecase';
import { UpdateOrganizationUsecase } from '../../../interactors/usecases/UpdateOrganizationUsecase';
import {
  CreateOrganizationResponse,
  CreateOrganizationRequest,
} from '../dto/CreateOrganization';
import {
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
} from '../dto/UpdateOrganization';
import { Organization } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';

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
  @ApiBearerAuth()
  async create(
    @Body() body: CreateOrganizationRequest,
    @Req() request: Request,
  ): Promise<CreateOrganizationResponse> {
    const userId = request.user.sub;
    const result = await this.createOrganizationUsecase.execute(
      body.name,
      body.code,
      userId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      code: result.value.code,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Patch()
  @ApiBearerAuth()
  @ApiResponse({ type: UpdateOrganizationResponse })
  async update(
    @Body() body: UpdateOrganizationRequest,
  ): Promise<UpdateOrganizationResponse> {
    const result = await this.updateOrganizationUsecase.execute(
      body.id,
      body.name,
      body.code,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      code: result.value.code,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Get(':id')
  @ApiResponse({ type: Organization })
  async getOne(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<Organization> {
    const userId = request.user?.sub ?? undefined;
    const result = await this.findOneOrAllOrganizationsUsecase.execute({
      organizationId: id,
      userId,
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
  @ApiBearerAuth()
  async getAll(@Req() request: Request): Promise<Organization[]> {
    const result = await this.findOneOrAllOrganizationsUsecase.execute({
      userId: request.user.sub,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    const organizations: Organization[] = result.value.map((organization) => ({
      id: organization.id,
      name: organization.name,
      code: organization.code,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      userRoleInOrganization: organization.roleInOrganization,
    }));

    return organizations;
  }

  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.removeOrganizationUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);
  }
}
