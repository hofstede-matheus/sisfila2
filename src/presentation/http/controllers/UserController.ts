import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthenticateUserUsecase } from '../../../interactors/usecases/AuthenticateUserUsecase';
import { CreateCoordinatorUsecase } from '../../../interactors/usecases/CreateCoordinatorUsecase';
import {
  AuthenticateUserRequest,
  AuthenticateUserResponse,
} from '../dto/AuthenticateUser';
import { CreateUserRequest, CreateUserResponse } from '../dto/CreateUser';
import { toPresentationError } from '../errors';

@Controller('users')
export class UserController {
  constructor(
    private readonly createCoordinatorUsecase: CreateCoordinatorUsecase,
    private readonly authenticateUserUsecase: AuthenticateUserUsecase,
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

  @Post('auth')
  @HttpCode(200)
  async authenticateUser(
    @Body() body: AuthenticateUserRequest,
  ): Promise<AuthenticateUserResponse> {
    const token = await this.authenticateUserUsecase.execute(
      body.email,
      body.password,
    );

    if (token.isLeft()) throw toPresentationError(token.value);

    return { token: token.value };
  }
}
