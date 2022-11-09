import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CreateOrganizationUsecase } from '../../../interactors/usecases/CreateOrganizationUsecase';
import { FindOneOrAllOrganizationsUsecase } from '../../../interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { RemoveOrganizationUsecase } from '../../../interactors/usecases/RemoveOrganizationUsecase';
import { UpdateOrganizationUsecase } from '../../../interactors/usecases/UpdateOrganizationUsecase';
import {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from '../dto/CreateOrganization';
import { Organization } from '../dto/shared';
import { UpdateOrganizationRequest } from '../dto/UpdateOrganization';
import { toPresentationError } from '../errors';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUsecase: CreateOrganizationUsecase,
    private readonly updateOrganizationUsecase: UpdateOrganizationUsecase,
    private readonly findOneOrAllOrganizationsUsecase: FindOneOrAllOrganizationsUsecase,
    private readonly removeOrganizationUsecase: RemoveOrganizationUsecase,
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

  @Version(['1'])
  @Get(':id')
  @ApiResponse({ type: Organization })
  async getOne(@Param('id') id: string): Promise<Organization> {
    const result = await this.findOneOrAllOrganizationsUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value[0].id,
      name: result.value[0].name,
      code: result.value[0].code,
      createdAt: result.value[0].createdAt,
      updatedAt: result.value[0].updatedAt,
    };
  }

  @Version(['1'])
  @Get()
  @ApiResponse({ type: Array<Organization> })
  async getAll(): Promise<Organization[]> {
    const result = await this.findOneOrAllOrganizationsUsecase.execute();

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

  @Version(['1'])
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.removeOrganizationUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);
  }
}
