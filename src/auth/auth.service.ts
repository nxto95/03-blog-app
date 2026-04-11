import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon from 'argon2';
import { CreateUserDto } from '../dtos';
import { UserRole } from '../entities';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getByEmailForAuth(email);
    if (!user) throw new UnauthorizedException();
    const isPasswordMatch = await argon.verify(user.password, password);
    if (!isPasswordMatch) throw new UnauthorizedException();
    return user;
  }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const payload = this.generatePayload(user);
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(payload),
      this.generateRefreshTokens(payload),
    ]);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async login(user: { id: string; role: UserRole }) {
    const payload = this.generatePayload(user);
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(payload),
      this.generateRefreshTokens(payload),
    ]);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async logout(user: { id: string }) {
    await this.usersService.removeRefreshToken(user.id);
  }

  async refresh(user: { id: string; role: UserRole }) {
    const payload = this.generatePayload(user);
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(payload),
      this.generateRefreshTokens(payload),
    ]);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  //   tokens
  async generateAccessTokens(payload: JwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRY'),
    });
  }

  async generateRefreshTokens(payload: JwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRY'),
    });
  }

  generatePayload(user: { id: string; role: UserRole }): JwtPayload {
    return { sub: user.id, role: user.role };
  }
}
