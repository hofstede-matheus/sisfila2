import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Group } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { FindOneOrAllGroupsUsecase } from '../../../interactors/usecases/FindOneOrAllGroupsUsecase';
import { Request } from 'express';
import { CreateGroupRequest, CreateGroupResponse } from '../dto/CreateGroup';
import { ImportClientsRequest } from '../dto/ImportClients';
import { CreateGroupUsecase } from '../../../interactors/usecases/CreateGroupUsecase';
import { ImportClientsToGroupUsecase } from '../../../interactors/usecases/ImportClientsToGroupUsecase';

@Controller({ path: 'groups', version: '1' })
export class GroupController {
  constructor(
    private readonly findOneOrAllGroupsUsecase: FindOneOrAllGroupsUsecase,
    private readonly createGroupUsecase: CreateGroupUsecase,
    private readonly importClientsToGroupUsecase: ImportClientsToGroupUsecase,
  ) {}

  @Get('organizations/:id')
  @ApiResponse({ type: [Group] })
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

    return { id: result.value };
  }

  @Post('import')
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
}
