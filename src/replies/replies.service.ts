import { Injectable, NotFoundException } from '@nestjs/common';
import { Reply } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReplyDto, UpdateReplyDto } from '../dtos';

@Injectable()
export class RepliesService {
  constructor(
    @InjectRepository(Reply)
    private readonly repliesRepository: Repository<Reply>,
  ) {}

  async create(
    userId: string,
    commentId: string,
    dto: CreateReplyDto,
  ): Promise<Reply> {
    const replyObj = this.repliesRepository.create({
      authorId: userId,
      relatedCommentId: commentId,
      content: dto.content,
    });
    return this.repliesRepository.save(replyObj);
  }

  async delete(
    userId: string,
    commentId: string,
    replyId: string,
  ): Promise<void> {
    const result = await this.repliesRepository.delete({
      id: replyId,
      authorId: userId,
      relatedCommentId: commentId,
    });
    if (result.affected === 0) throw new NotFoundException();
  }

  async update(
    userId: string,
    commentId: string,
    replyId: string,
    dto: UpdateReplyDto,
  ): Promise<void> {
    const result = await this.repliesRepository.update(
      {
        id: replyId,
        authorId: userId,
        relatedCommentId: commentId,
      },
      dto,
    );
    if (result.affected === 0) throw new NotFoundException();
  }

  async getById(
    userId: string,
    commentId: string,
    replyId: string,
  ): Promise<Reply | null> {
    return this.repliesRepository
      .createQueryBuilder('reply')
      .where('reply.id = :replyId', { replyId })
      .andWhere('reply.authorId = :userId', { userId })
      .andWhere('reply.relatedCommentId = :commentId', { commentId })
      .getOne();
  }
}
