import { Body, Controller, Post } from '@nestjs/common';
import { CreateCoordinatorUsecase } from '../../../interactors/usecases/CreateCoordinatorUsecase';
import { CreateUserRequest, CreateUserResponse } from '../dto/CreateUser';
import { toPresentationError } from '../errors';

@Controller('users')
export class UserController {
  constructor(
    private readonly createCoordinatorUsecase: CreateCoordinatorUsecase,
  ) {}

  @Post()
  async createUser(
    @Body() body: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    const token = await this.createCoordinatorUsecase.execute(
      body.name,
      body.email,
      body.password,
      body.userType,
    );

    if (token.isLeft()) throw toPresentationError(token.value);

    return { token: token.value };
  }
}
