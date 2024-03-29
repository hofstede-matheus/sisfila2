import { Test, TestingModule } from '@nestjs/testing';
import { InvalidOauthDataError } from '../../../src/modules/common/domain/errors';
import { UserRepository } from '../../../src/modules/users/domain/repositories/UserRepository';
import { AuthenticationService } from '../../../src/modules/common/domain/services/AuthenticationService';
import { AuthenticateWithGoogleUsecase } from '../../../src/modules/users/interactors/usecases/AuthenticateWithGoogleUsecase';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  checkForTokenAndUserId,
  VALID_USER,
} from '../../helpers';
import { OAuthService } from '../../../src/modules/common/domain/services/OauthAuthenticationService';

describe('AuthenticateWithGoogleUsecase', () => {
  let useCase: AuthenticateWithGoogleUsecase;
  let repository: UserRepository;
  let authenticationService: AuthenticationService;
  let oAuthService: OAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        AuthenticateWithGoogleUsecase,
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    oAuthService = module.get<OAuthService>(OAuthService);
    useCase = module.get<AuthenticateWithGoogleUsecase>(
      AuthenticateWithGoogleUsecase,
    );
  });

  it('should NOT be able to authenticate with no oauthToken', async () => {
    const response = await useCase.execute(undefined, 'valid_audience');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidOauthDataError());
  });

  it('should NOT be able to authenticate with no audience', async () => {
    const response = await useCase.execute('valid_token', undefined);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidOauthDataError());
  });

  it('should NOT be able to authenticate with invalid data', async () => {
    jest.spyOn(oAuthService, 'getUserProfile').mockImplementation(() => {
      return undefined;
    });

    const response = await useCase.execute('invalid_token', 'invalid_audience');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidOauthDataError());
  });

  it('should be able to authenticate with valid data when user already exists', async () => {
    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return VALID_USER;
    });

    jest.spyOn(authenticationService, 'generate').mockImplementation(() => {
      return 'valid_token';
    });

    jest.spyOn(oAuthService, 'getUserProfile').mockImplementation(async () => {
      return {
        email: VALID_USER.email,
        email_verified: true,
        family_name: VALID_USER.name,
        given_name: VALID_USER.name,
        name: VALID_USER.name,
        hd: '@email.com',
        locale: 'en',
        picture: '',
        sub: '123456789',
      };
    });
    const response = await useCase.execute('valid_token', 'valid_audience');

    checkForTokenAndUserId(response);
  });

  it('should be able to authenticate with valid data when user NOT exists', async () => {
    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return undefined;
    });

    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return VALID_USER;
    });

    jest.spyOn(authenticationService, 'generate').mockImplementation(() => {
      return 'valid_token';
    });

    jest.spyOn(oAuthService, 'getUserProfile').mockImplementation(async () => {
      return {
        email: VALID_USER.email,
        email_verified: true,
        family_name: VALID_USER.name,
        given_name: VALID_USER.name,
        name: VALID_USER.name,
        hd: '@email.com',
        locale: 'en',
        picture: '',
        sub: '123456789',
      };
    });
    const response = await useCase.execute('valid_token', 'valid_audience');

    checkForTokenAndUserId(response);
  });
});
