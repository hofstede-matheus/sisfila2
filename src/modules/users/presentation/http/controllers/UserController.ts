import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  UserEntity,
  UserEntityTypes,
} from '../../../domain/entities/User.entity';
import { AuthenticateUserUsecase } from '../../../interactors/usecases/AuthenticateUserUsecase';
import { AuthenticateWithGoogleUsecase } from '../../../interactors/usecases/AuthenticateWithGoogleUsecase';
import { CreateUserUsecase } from '../../../interactors/usecases/CreateUserUsecase';
import { FindOneOrAllUsersUsecase } from '../../../interactors/usecases/FindOneOrAllUsersUsecase';
import { SetUserRoleInOrganizationUsecase } from '../../../interactors/usecases/SetUserRoleInOrganizationUsecase';
import {
  AuthenticateUserResponse,
  AuthenticateUserRequest,
} from '../dto/AuthenticateUser';
import { AuthenticateWithGoogleRequest } from '../dto/AuthenticateWithGoogle';
import { CreateUserResponse, CreateUserRequest } from '../dto/CreateUser';
import { SetUserRoleInOrganizationRequest } from '../dto/SetUserRoleInOrganization';
import { User } from '../../../../common/presentation/http/dto/_shared';
import { toPresentationError } from '../../../../common/presentation/http/errors';
import { Request } from 'express';

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
  @ApiResponse({ type: User })
  @ApiBearerAuth()
  async setUserRoleInOrganizationById(
    @Param('userId') userId: string,
    @Param('organizationId') organizationId: string,
    @Body() body: SetUserRoleInOrganizationRequest,
    @Req() request: Request,
  ): Promise<User> {
    const requestingUserId = request.user.sub;
    const result = await this.setUserRoleInOrganizationUsecase.execute(
      organizationId,
      body.role as UserEntityTypes,
      requestingUserId,
      userId,
      undefined,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      email: result.value.email,
      rolesInOrganizations: result.value.rolesInOrganizations,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Patch('email/:userEmail/organizations/:organizationId')
  @HttpCode(200)
  @ApiResponse({ type: User })
  @ApiBearerAuth()
  async setUserRoleInOrganizationByEmail(
    @Param('organizationId') organizationId: string,
    @Param('userEmail') userEmail: string,
    @Body() body: SetUserRoleInOrganizationRequest,
    @Req() request: Request,
  ): Promise<User> {
    const requestingUserId = request.user.sub;
    const result = await this.setUserRoleInOrganizationUsecase.execute(
      organizationId,
      body.role as UserEntityTypes,
      requestingUserId,
      undefined,
      userEmail,
    );

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value.id,
      name: result.value.name,
      email: result.value.email,
      rolesInOrganizations: result.value.rolesInOrganizations,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  @Get(':userId/organizations/:organizationId')
  @ApiResponse({ type: User })
  @HttpCode(200)
  @ApiBearerAuth()
  async getOne(
    @Param('userId') userId: string,
    @Param('organizationId') organizationId: string,
    @Req() request: Request,
  ): Promise<User> {
    const result = await this.findOneOrAllUsersUsecase.execute({
      organizationId,
      requestingUserId: request.user.sub,
      searchedUserId: userId,
    });

    if (result.isLeft()) throw toPresentationError(result.value);

    return {
      id: result.value[0].id,
      name: result.value[0].name,
      email: result.value[0].email,
      createdAt: result.value[0].createdAt,
      updatedAt: result.value[0].updatedAt,
      rolesInOrganizations: result.value[0].rolesInOrganizations,
    };
  }
}
