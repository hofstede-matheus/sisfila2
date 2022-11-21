import { Controller, Get, Param, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FindOneOrAllQueuesUsecase } from '../../../../interactors/usecases/FindOneOrAllQueuesUsecase';
import { Queue } from '../../dto/_shared';
import { toPresentationError } from '../../errors';

@Controller({ path: 'queues', version: '1' })
export class QueueController {
  constructor(
    private readonly findOneOrAllQueuesUsecase: FindOneOrAllQueuesUsecase,
  ) {}

  @Version(['1'])
  @Get('organizations/:id')
  @ApiResponse({ type: [Queue] })
  async getOne(@Param('id') id: string): Promise<Queue[]> {
    const result = await this.findOneOrAllQueuesUsecase.execute(id);

    if (result.isLeft()) throw toPresentationError(result.value);

    const mappedQueues: Queue[] = result.value.map((service) => {
      return {
        id: service.id,
        name: service.name,
        organizationId: service.organizationId,
        serviceId: service.serviceId,
        code: service.code,
        description: service.description,
        priority: service.priority,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    });
    return mappedQueues;
  }
}
