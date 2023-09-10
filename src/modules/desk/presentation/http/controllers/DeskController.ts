import { Body, Controller, Post } from '@nestjs/common';
import { CreateDeskRequest, CreateDeskResponse } from '../dto/CreateDesk';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateDeskUsecase } from '../../../interactors/usecases/CreateDeskUsecase';

@Controller({ path: 'desks', version: '1' })
export class DeskController {
  constructor(private readonly createDeskUsecase: CreateDeskUsecase) {}

  @Post()
  @ApiResponse({ type: CreateDeskResponse })
  @ApiBearerAuth()
  async createDesk(
    @Body() body: CreateDeskRequest,
  ): Promise<CreateDeskResponse> {
    const result = await this.createDeskUsecase.execute(
      body.name,
      body.organizationId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      organizationId: result.value.organizationId,
      services: result.value.services.map((service) => ({
        id: service.id,
        name: service.name,
        subscriptionToken: service.subscriptionToken,
        guestEnroll: service.guestEnrollment,
        organizationId: service.organizationId,
        opensAt: service.opensAt,
        closesAt: service.closesAt,

        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),

      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }
}
