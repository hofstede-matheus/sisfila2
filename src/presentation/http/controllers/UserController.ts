import { Body, Controller, HttpCode, Post, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AuthenticateUserUsecase } from '../../../interactors/usecases/AuthenticateUserUsecase';
import { AuthenticateWithGoogleUsecase } from '../../../interactors/usecases/AuthenticateWithGoogleUsecase';
import { CreateUserUsecase } from '../../../interactors/usecases/CreateUserUsecase';
import {
  AuthenticateUserRequest,
  AuthenticateUserResponse,
} from '../dto/AuthenticateUser';
import { AuthenticateWithGoogleRequest } from '../dto/AuthenticateWithGoogle';
import { CreateUserRequest, CreateUserResponse } from '../dto/CreateUser';
import { toPresentationError } from '../errors';

@Controller('users')
export class UserController {
  constructor(
    private readonly createCoordinatorUsecase: CreateUserUsecase,
    private readonly authenticateUserUsecase: AuthenticateUserUsecase,
    private readonly authenticateWithGoogleUsecase: AuthenticateWithGoogleUsecase,
  ) {}

  @Version(['1'])
  @Post()
  @ApiResponse({ type: CreateUserResponse })
  async createUser(
    @Body() body: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    const token = await this.createCoordinatorUsecase.execute(
      body.name,
      body.email,
      body.password,
    );

    if (token.isLeft()) throw toPresentationError(token.value);

    return { token: token.value, user: undefined };
  }

  @Version(['1'])
  @Post('auth')
  @ApiResponse({ type: AuthenticateUserResponse })
  @HttpCode(200)
  async authenticateUser(
    @Body() body: AuthenticateUserRequest,
  ): Promise<AuthenticateUserResponse> {
    const token = await this.authenticateUserUsecase.execute(
      body.email,
      body.password,
    );

    if (token.isLeft()) throw toPresentationError(token.value);

    return { token: token.value, user: undefined };
  }

  @Version(['1'])
  @Post('auth/google')
  @ApiResponse({ type: AuthenticateUserResponse })
  @HttpCode(200)
  async authenticateWithGoogle(
    @Body() body: AuthenticateWithGoogleRequest,
  ): Promise<AuthenticateUserResponse> {
    const token = await this.authenticateWithGoogleUsecase.execute(
      body.oauthToken,
      body.audience,
    );

    if (token.isLeft()) throw toPresentationError(token.value);

    return { token: token.value, user: undefined };
  }
}
