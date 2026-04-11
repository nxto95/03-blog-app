import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entities';
import { Repository } from 'typeorm';
import { CreatePostDto, UpdatePostDto } from '../dtos';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
  ) {}

  async create(userId: string, dto: CreatePostDto): Promise<Post> {
    const postObj = this.postsRepository.create({
      content: dto.content,
      authorId: userId,
    });
    return this.postsRepository.save(postObj);
  }

  async delete(userId: string, postId: string): Promise<void> {
    const result = await this.postsRepository.delete({
      id: postId,
      authorId: userId,
    });
    if (result.affected === 0) throw new NotFoundException();
  }

  async update(
    userId: string,
    postId: string,
    dto: UpdatePostDto,
  ): Promise<void> {
    const result = await this.postsRepository.update(
      {
        id: postId,
        authorId: userId,
      },
      dto,
    );
    if (result.affected === 0) throw new NotFoundException();
  }

  async getById(userId: string, postId: string): Promise<Post | null> {
    return this.postsRepository
      .createQueryBuilder('post')
      .where('post.id = :postId', { postId })
      .andWhere('post.authorId = :userId', { userId })
      .getOne();
  }

  async getAll(userId: string): Promise<[Post[], number]> {
    return this.postsRepository
      .createQueryBuilder('post')
      .where('post.authorId = :userId', { userId })
      .getManyAndCount();
  }
}
