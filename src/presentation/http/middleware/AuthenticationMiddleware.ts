import {
  HttpException,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '../../../domain/services/AuthenticationService';
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    @Inject(AuthenticationService)
    private readonly authService: AuthenticationService,
  ) {}

  use(req: Request, _: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) throw new HttpException('Invalid token', 400);

    const token = authorizationHeader.split(' ')[1];

    const decryptedToken = this.authService.decrypt(token);

    if (!decryptedToken) throw new HttpException('Invalid token', 400);

    req.user = decryptedToken;

    next();
  }
}
