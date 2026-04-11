import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN } from '../auth/auth.controller';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/auth.service';
import * as argon from 'argon2';
import { UsersService } from '../users/users.service';

const cookieExtractor = (req: Request): string | null => {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[REFRESH_TOKEN] ?? null;
};

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }
  async validate(req: Request, payload: JwtPayload) {
    const user = await this.usersService.getById(payload.sub);
    if (!user || !user.refreshToken) throw new ForbiddenException();

    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.[REFRESH_TOKEN];
    if (!refreshToken) throw new ForbiddenException();
    const isTokenMatch = await argon.verify(user.refreshToken, refreshToken);
    if (!isTokenMatch) throw new ForbiddenException();

    return {
      id: payload.sub,
      role: payload.role,
    };
  }
}
