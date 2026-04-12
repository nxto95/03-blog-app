import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from '../dtos';
import { User } from '../entities';
import * as argon from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await argon.hash(dto.password);
      const userObj = this.userRepository.create({
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      });
      return await this.userRepository.save(userObj);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error as any;
        if (err.code === '23505') {
          if (err.constraint === 'unique_email')
            throw new ConflictException('email already exist');
          if (err.constraint === 'unique_username')
            throw new ConflictException('username already exist');
        }
      }
      throw error;
    }
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async getByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async setRefreshToken(
    userId: string,
    refreshToken: string,
    newRefreshTokenJti: string,
  ): Promise<void> {
    const hashed = await argon.hash(refreshToken);
    const result = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ refreshToken: hashed, refreshTokenJti: newRefreshTokenJti })
      .where('id = :userId', { userId })
      .execute();
    if (result.affected === 0)
      throw new UnauthorizedException('Invalid or expired refresh token');
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    oldRefreshTokenJti: string | null | undefined,
    newRefreshTokenJti: string,
  ) {
    const hashed = await argon.hash(refreshToken);
    const result = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ refreshToken: hashed, refreshTokenJti: newRefreshTokenJti })
      .where('id = :userId', { userId })
      .andWhere('refreshTokenJti = :oldRefreshTokenJti', { oldRefreshTokenJti })
      .execute();
    if (result.affected === 0)
      throw new UnauthorizedException('Invalid or expired refresh token');
  }

  async removeRefreshToken(userId: string) {
    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ refreshToken: null, refreshTokenJti: null })
      .where('id = :userId', { userId })
      .execute();
  }
}
