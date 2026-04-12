import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { JwtPayload, REDIS_CLIENT } from '../types';
import { Request } from 'express';

@Injectable()
export class BlackList implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const normalized = request.url.split('?')[0].replace(/\/+$/, '');
    const excludedPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (excludedPaths.includes(normalized)) return true;

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new UnauthorizedException();

    const accessToken = authHeader.replace(/^Bearer\s+/gi, '').trim();
    if (!accessToken) throw new UnauthorizedException();

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(accessToken, {
        secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    if (!payload?.jti) throw new UnauthorizedException();

    const isBlacklisted =
      (await this.redisClient.exists(`bl:access:${payload.jti}`)) === 1;

    if (isBlacklisted) throw new UnauthorizedException();

    return true;
  }
}
