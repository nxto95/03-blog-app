import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dtos';
import type { Response } from 'express';
import { UserRole } from '../entities';
import { AccessGuard, LocalGuard, RefreshGuard } from '../guards';
import { CurrentUser } from '../decorators';

export const REFRESH_TOKEN = 'refreshToken';
const isProd = process.env.NODE_ENV === 'production';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'user registered',
      accessToken,
    };
  }

  @Post('login')
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: { user: { id: string; role: UserRole } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'user logged in',
      accessToken,
    };
  }

  @Post('logout')
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: { user: { id: string; role: UserRole } },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user);
    res.clearCookie(REFRESH_TOKEN, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/auth/refresh',
    });
    return {
      message: 'user logged out',
    };
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: { user: { id: string; role: UserRole } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refresh(
      req.user,
    );
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      message: 'tokens refreshed',
      accessToken,
    };
  }

  @Get('profile')
  @UseGuards(AccessGuard)
  get(@CurrentUser() user: any) {
    console.log(user);
  }
}
