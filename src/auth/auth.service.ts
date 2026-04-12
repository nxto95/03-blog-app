import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon from 'argon2';
import { CreateUserDto } from '../dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AuthUser, JwtPayload, REDIS_CLIENT } from '../types';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getByEmailForAuth(email);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const isPasswordMatch = await argon.verify(user.password, password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('invalid credentials');
    return {
      id: user.id,
      role: user.role,
    };
  }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const payload = this.createPayload(user);
    const { accessToken, refreshToken, jti } =
      await this.generateTokens(payload);
    await this.usersService.setRefreshToken(user.id, refreshToken, jti);
    return { accessToken, refreshToken };
  }

  async login(user: AuthUser) {
    const payload = this.createPayload(user);
    const { accessToken, refreshToken, jti } =
      await this.generateTokens(payload);
    await this.usersService.setRefreshToken(user.id, refreshToken, jti);
    return { accessToken, refreshToken };
  }

  async logout(user: AuthUser) {
    await this.usersService.removeRefreshToken(user.id);
    await this.redisClient.set(`bl:access:${user.jti}`, '1', 'EX', 10 * 60);
  }

  async refresh(user: AuthUser) {
    const payload = this.createPayload(user);
    const {
      accessToken,
      refreshToken,
      jti: newRefreshTokenJti,
    } = await this.generateTokens(payload);
    await this.usersService.updateRefreshToken(
      user.id,
      refreshToken,
      user.jti,
      newRefreshTokenJti,
    );
    return { accessToken, refreshToken };
  }

  //   tokens

  async generateTokens(payload: JwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
    jti: string;
  }> {
    const jti = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: payload.sub, role: payload.role, jti },
        {
          secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRY'),
        },
      ),
      this.jwtService.signAsync(
        { sub: payload.sub, jti },
        {
          secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRY'),
        },
      ),
    ]);
    return { accessToken, refreshToken, jti };
  }

  createPayload(user: AuthUser): JwtPayload {
    return { sub: user.id, role: user.role };
  }
}
