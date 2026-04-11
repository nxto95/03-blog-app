import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AccessStrategy, LocalStrategy, RefreshStrategy } from '../strategies';

@Module({
  imports: [PassportModule, JwtModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, AccessStrategy, RefreshStrategy],
})
export class AuthModule {}
