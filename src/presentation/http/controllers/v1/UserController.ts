import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UserEntityTypes } from '../../../../domain/entities/User.entity';
import { AuthenticateUserUsecase } from '../../../../interactors/usecases/AuthenticateUserUsecase';
import { AuthenticateWithGoogleUsecase } from '../../../../interactors/usecases/AuthenticateWithGoogleUsecase';
import { CreateUserUsecase } from '../../../../interactors/usecases/CreateUserUsecase';
import { FindOneOrAllUsersUsecase } from '../../../../interactors/usecases/FindOneOrAllUsersUsecase';
import { SetUserRoleInOrganizationUsecase } from '../../../../interactors/usecases/SetUserRoleInOrganizationUsecase';
import {
  AuthenticateUserResponse,
  AuthenticateUserRequest,
} from '../../dto/AuthenticateUser';
import { AuthenticateWithGoogleRequest } from '../../dto/AuthenticateWithGoogle';
import { CreateUserResponse, CreateUserRequest } from '../../dto/CreateUser';
import { SetUserRoleInOrganizationRequest } from '../../dto/SetUserRoleInOrganization';
import { User } from '../../dto/_shared';
import { toPresentationError } from '../../errors';

@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(
    private readonly createCoordinatorUsecase: CreateUserUsecase,
    private readonly authenticateUserUsecase: AuthenticateUserUsecase,
    private readonly authenticateWithGoogleUsecase: AuthenticateWithGoogleUsecase,
    private readonly setUserRoleInOrganizationUsecase: SetUserRoleInOrganizationUsecase,
    private readonly findOneOrAllUsersUsecase: FindOneOrAllUsersUsecase,
  ) {}

  @Post()
  @ApiResponse({ type: CreateUserResponse })
  async createUser(
    @Body() body: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    const result = await this.createCoordinatorUsecase.execute(
      body.name,
      body.email,
      body.password,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      token: result.value.token,
      user: { ...result.value.user },
    };
  }

  @Post('auth')
  @ApiResponse({ type: AuthenticateUserResponse })
  @HttpCode(200)
  async authenticateUser(
    @Body() body: AuthenticateUserRequest,
  ): Promise<AuthenticateUserResponse> {
    const result = await this.authenticateUserUsecase.execute(
      body.email,
      body.password,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      token: result.value.token,
      user: { ...result.value.user },
    };
  }

  @Post('auth/google')
  @ApiResponse({ type: AuthenticateUserResponse })
  @HttpCode(200)
  async authenticateWithGoogle(
    @Body() body: AuthenticateWithGoogleRequest,
  ): Promise<AuthenticateUserResponse> {
    const result = await this.authenticateWithGoogleUsecase.execute(
      body.oauthToken,
      body.audience,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      token: result.value.token,
      user: { ...result.value.user },
    };
  }

  @Patch(':userId/organizations/:organizationId')
  @HttpCode(200)
  async setUserRoleInOrganizationById(
    @Param('userId') userId: string,
    @Param('organizationId') organizationId: string,
    @Body() body: SetUserRoleInOrganizationRequest,
  ): Promise<void> {
    const result = await this.setUserRoleInOrganizationUsecase.execute(
      organizationId,
      body.role as UserEntityTypes,
      userId,
      undefined,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }

  @Patch('email/:userEmail/organizations/:organizationId')
  @HttpCode(200)
  async setUserRoleInOrganizationByEmail(
    @Param('organizationId') organizationId: string,
    @Param('userEmail') userEmail: string,
    @Body() body: SetUserRoleInOrganizationRequest,
  ): Promise<void> {
    const result = await this.setUserRoleInOrganizationUsecase.execute(
      organizationId,
      body.role as UserEntityTypes,
      undefined,
      userEmail,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return;
  }

  @Get(':userId')
  @ApiResponse({ type: User })
  @HttpCode(200)
  async getUser(@Param('userId') userId: string): Promise<User> {
    const result = await this.findOneOrAllUsersUsecase.execute(userId);

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value[0].id,
      name: result.value[0].name,
      email: result.value[0].email,
      createdAt: result.value[0].createdAt,
      updatedAt: result.value[0].updatedAt,
    };
  }
}
