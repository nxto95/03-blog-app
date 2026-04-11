import { ConflictException, Injectable } from '@nestjs/common';
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
        if (err.code === '23505')
          if (
            err.detail.match === 'unique_email' ||
            err.constraint === 'unique_username'
          )
            throw new ConflictException(err.detail);
      }
      throw error;
    }
  }

  async getById(id: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async getByEmailForAuth(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }
}
