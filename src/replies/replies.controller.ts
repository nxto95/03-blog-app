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
import { RepliesService } from './replies.service';
import { AccessGuard } from '../guards';
import { CurrentUser } from '../decorators';
import type { AuthUser } from '../posts/posts.controller';
import { CreateReplyDto, UpdateReplyDto } from '../dtos';

@Controller('replies')
@UseGuards(AccessGuard)
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @Post('comment/:commentId')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: CreateReplyDto,
  ) {
    const reply = await this.repliesService.create(user.id, commentId, dto);
    return {
      message: 'reply created',
      data: reply,
    };
  }
  @Get(':replyId/comment/:commentId')
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Param('replyId', ParseUUIDPipe) replyId: string,
  ) {
    const reply = await this.repliesService.getById(
      user.id,
      commentId,
      replyId,
    );
    return {
      message: 'reply retrieved',
      data: reply,
    };
  }
  @Patch(':replyId/comment/:commentId')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Param('replyId', ParseUUIDPipe) replyId: string,
    @Body() dto: UpdateReplyDto,
  ) {
    await this.repliesService.update(user.id, commentId, replyId, dto);
    return {
      message: 'reply updated',
    };
  }
  @Delete(':replyId/comment/:commentId')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Param('replyId', ParseUUIDPipe) replyId: string,
  ) {
    await this.repliesService.delete(user.id, commentId, replyId);
    return {
      message: 'reply deleted',
    };
  }
}
