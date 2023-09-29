import { Body, Controller, Param, Patch } from '@nestjs/common';
import { toPresentationError } from '../../../../../common/presentation/http/errors';
import { AddTokenToClientRequest } from '../../dto/AddTokenToClient';
import { AddTokenToClientUsecase } from '../../../../interactors/usecases/AddTokenToClientUsecase';
import { SubscribeToQueueRequest } from '../../dto/SubscribeToQueue';
import { SubscribeToQueueUsecase } from '../../../../interactors/usecases/SubscribeToQueueUsecase';

@Controller({ path: 'clients/notification', version: '1' })
export class ClientNotificationController {
  constructor(
    private readonly addTokenToClientUsecase: AddTokenToClientUsecase,
    private readonly subscribeToQueueUsecase: SubscribeToQueueUsecase,
  ) {}

  @Patch(':registrationId/organizations/:organizationId')
  async addTokenToClient(
    @Param('registrationId') registrationId: string,
    @Param('organizationId') organizationId: string,
    @Body() body: AddTokenToClientRequest,
  ): Promise<void> {
    const result = await this.addTokenToClientUsecase.execute(
      registrationId,
      organizationId,
      body.token,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }

  @Patch('subscribe')
  async subscribeToQueue(@Body() body: SubscribeToQueueRequest): Promise<void> {
    const result = await this.subscribeToQueueUsecase.execute(
      body.token,
      body.queueId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }

  @Patch('unsubscribe')
  async unsubscribeToQueue(
    @Body() body: SubscribeToQueueRequest,
  ): Promise<void> {
    const result = await this.subscribeToQueueUsecase.execute(
      body.token,
      body.queueId,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }
}
