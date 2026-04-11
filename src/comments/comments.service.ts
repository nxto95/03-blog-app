import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto, UpdateCommentDto } from '../dtos';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(userId: string, postId: string, dto: CreateCommentDto) {
    const commentObj = this.commentsRepository.create({
      content: dto.content,
      authorId: userId,
      relatedPostId: postId,
    });
    return this.commentsRepository.save(commentObj);
  }

  async delete(userId: string, postId: string, commentId: string) {
    const result = await this.commentsRepository.delete({
      id: commentId,
      authorId: userId,
      relatedPostId: postId,
    });
    if (result.affected === 0) throw new NotFoundException();
  }

  async update(
    userId: string,
    postId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ) {
    const result = await this.commentsRepository.update(
      {
        id: commentId,
        authorId: userId,
        relatedPostId: postId,
      },
      dto,
    );
    if (result.affected === 0) throw new NotFoundException();
  }

  async getById(userId: string, postId: string, commentId: string) {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .where('comment.id = :commentId', { commentId })
      .andWhere('comment.authorId = :userId', { userId })
      .andWhere('comment.relatedPostId = :postId', { postId })
      .getOne();
  }
}
