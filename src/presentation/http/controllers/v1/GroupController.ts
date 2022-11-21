import { Controller, Get, Param, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Group } from '../../dto/_shared';
import { toPresentationError } from '../../errors';
import { FindOneOrAllGroupsUsecase } from '../../../../interactors/usecases/FindOneOrAllGroupsUsecase';

@Controller({ path: 'groups', version: '1' })
export class GroupController {
  constructor(
    private readonly findOneOrAllGroupsUsecase: FindOneOrAllGroupsUsecase,
  ) {}

  @Version(['1'])
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
}
