import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { FindOneOrAllOrganizationsUsecase } from '../../../interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { Organization } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';

@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(
    private readonly findOneOrAllOrganizationsUsecase: FindOneOrAllOrganizationsUsecase,
  ) {}

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
}
