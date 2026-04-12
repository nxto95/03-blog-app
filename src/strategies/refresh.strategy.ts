import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { UsersService } from '../users/users.service';
import { JwtPayload, REFRESH_TOKEN } from '../types';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const cookies = req.cookies as Record<string, string> | undefined;
          return cookies?.[REFRESH_TOKEN] ?? null;
        },
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }
  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN];
    if (!refreshToken) throw new ForbiddenException('Invalid session');

    const user = await this.usersService.getById(payload.sub);
    if (!user || !user.refreshToken || !user.refreshTokenJti)
      throw new ForbiddenException('Invalid session');

    const isTokenMatch = await argon.verify(
      user.refreshToken,
      refreshToken as string,
    );
    if (!isTokenMatch) throw new ForbiddenException('Invalid token');

    if (user.refreshTokenJti !== payload.jti)
      throw new ForbiddenException('Invalid session');

    return {
      id: user.id,
      role: user.role,
      refreshToken,
      jti: payload.jti,
    };
  }
}
