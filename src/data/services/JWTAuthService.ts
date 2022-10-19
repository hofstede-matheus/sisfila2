import { Injectable } from '@nestjs/common';
import {
  AuthPayload,
  AuthenticationService,
} from '../../domain/services/AuthenticationService';
import { sign, decode } from 'jsonwebtoken';

@Injectable()
export class JWTAuthService implements AuthenticationService {
  generate(id: string): string {
    const payload: AuthPayload = {
      sub: id,
    };
    const token = sign(payload, process.env.JWT_SECRET ?? 'JWT_SECRET', {
      expiresIn: process.env.JWT_EXPIRATION ?? '1d',
    });
    return token;
  }

  decrypt(token: string): AuthPayload {
    return decode(token) as AuthPayload;
  }
}
