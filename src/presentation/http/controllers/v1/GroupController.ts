import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Group } from '../../dto/_shared';
import { toPresentationError } from '../../errors';
import { FindOneOrAllGroupsUsecase } from '../../../../interactors/usecases/FindOneOrAllGroupsUsecase';
import { Request } from 'express';
import { CreateGroupRequest, CreateGroupResponse } from '../../dto/CreateGroup';
import { importClientsRequest } from '../../dto/ImportClients';
import { string } from 'joi';

@Controller({ path: 'groups', version: '1' })
export class GroupController {
  constructor(
    private readonly findOneOrAllGroupsUsecase: FindOneOrAllGroupsUsecase,
  ) {}

  @Get('organizations/:id')
  @ApiResponse({ type: [Group] })
  async getOne(@Param('id') id: string): Promise<Group[]> {
    const result = await this.findOneOrAllGroupsUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedGroups: Group[] = result.value.map((service) => {
      return {
        id: service.id,
        name: service.name,
        organizationId: service.organizationId,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    });
    return mappedGroups;
  }

  @Post()
  @ApiResponse({ type: CreateGroupResponse })
  async create(
    @Body() body: CreateGroupRequest,
    @Req() request: Request,
  ): Promise<Group[]> {
    const userId = request.user.sub;

    throw new Error('Method not implemented.');
  }

  @Post('import')
  async importClients(
    @Body() body: importClientsRequest,
    @Req() request: Request,
  ): Promise<Group[]> {
    const userId = request.user.sub;

    throw new Error('Method not implemented.');
  }
}
