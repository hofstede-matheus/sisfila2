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
import { Group } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { FindOneOrAllGroupsUsecase } from '../../../interactors/usecases/FindOneOrAllGroupsUsecase';
import { Request } from 'express';
import { CreateGroupRequest, CreateGroupResponse } from '../dto/CreateGroup';
import { ImportClientsRequest } from '../dto/ImportClients';
import { CreateGroupUsecase } from '../../../interactors/usecases/CreateGroupUsecase';
import { ImportClientsToGroupUsecase } from '../../../interactors/usecases/ImportClientsToGroupUsecase';
import { UpdateGroupRequest } from '../dto/UpdateGroup';
import { UpdateGroupUsecase } from '../../../interactors/usecases/UpdateGroupUsecase';
import { RemoveGroupUsecase } from '../../../interactors/usecases/RemoveGroupUsecase';

@Controller({ path: 'groups', version: '1' })
export class GroupController {
  constructor(
    private readonly findOneOrAllGroupsUsecase: FindOneOrAllGroupsUsecase,
    private readonly createGroupUsecase: CreateGroupUsecase,
    private readonly importClientsToGroupUsecase: ImportClientsToGroupUsecase,
    private readonly updateGroupUsecase: UpdateGroupUsecase,
    private readonly removeGroupUsecase: RemoveGroupUsecase,
  ) {}

  @Get('organizations/:id')
  @ApiResponse({ type: [Group] })
  @ApiBearerAuth()
  async getAllFromOrgagnization(@Param('id') id: string): Promise<Group[]> {
    const result = await this.findOneOrAllGroupsUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedGroups: Group[] = result.value.map((group) => {
      return {
        id: group.id,
        name: group.name,
        organizationId: group.organizationId,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        clients: group.clients.map((client) => {
          return {
            id: client.id,
            name: client.name,
            organizationId: client.organizationId,
            registrationId: client.registrationId,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
          };
        }),
      };
    });
    return mappedGroups;
  }

  @Post()
  @ApiResponse({ type: CreateGroupResponse })
  @ApiBearerAuth()
  async create(
    @Body() body: CreateGroupRequest,
    @Req() request: Request,
  ): Promise<CreateGroupResponse> {
    const userId = request.user.sub;

    const result = await this.createGroupUsecase.execute(
      body.name,
      body.organizationId,
      userId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Post('import')
  @ApiBearerAuth()
  async importClients(
    @Body() body: ImportClientsRequest,
    @Req() request: Request,
  ): Promise<void> {
    const userId = request.user.sub;

    const result = await this.importClientsToGroupUsecase.execute(
      userId,
      body.groupId,
      body.organizationId,
      body.clients,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }

  @Patch(':id/organizations/:organizationId')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
    @Body() body: UpdateGroupRequest,
    @Req() request: Request,
  ): Promise<Group> {
    const userId = request.user.sub;

    const result = await this.updateGroupUsecase.execute(
      id,
      body.name,
      organizationId,
      userId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
      clients: result.value.clients.map((client) => {
        return {
          id: client.id,
          name: client.name,
          organizationId: client.organizationId,
          registrationId: client.registrationId,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        };
      }),
    };
  }

  @Delete(':id/organizations/:organizationId')
  @ApiBearerAuth()
  async delete(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = request.user.sub;

    const result = await this.removeGroupUsecase.execute(
      id,
      organizationId,
      userId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }
}
