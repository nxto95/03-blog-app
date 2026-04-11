import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AccessGuard } from '../guards';
import { CurrentUser } from '../decorators';
import type { AuthUser } from '../posts/posts.controller';
import { CreateCommentDto, UpdateCommentDto } from '../dtos';

@Controller('comments')
@UseGuards(AccessGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('post/:postId')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.create(user.id, postId, dto);
    return {
      message: 'comment created',
      data: comment,
    };
  }
  @Get(':commentId/post/:postId')
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    const comment = await this.commentsService.getById(
      user.id,
      postId,
      commentId,
    );
    return {
      message: 'comment retrieved',
      data: comment,
    };
  }
  @Patch(':commentId/post/:postId')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    await this.commentsService.update(user.id, postId, commentId, dto);
    return {
      message: 'comment updated',
    };
  }
  @Delete(':commentId/post/:postId')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    await this.commentsService.delete(user.id, postId, commentId);
    return {
      message: 'comment deleted',
    };
  }
}
