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
import { PostsService } from './posts.service';
import { AccessGuard } from '../guards';
import { CurrentUser } from '../decorators';
import { CreatePostDto, UpdatePostDto } from '../dtos';

export type AuthUser = {
  id: string;
  role: string;
};

@Controller('posts')
@UseGuards(AccessGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreatePostDto) {
    const post = await this.postsService.create(user.id, dto);
    return {
      message: 'post created',
      data: post,
    };
  }

  @Get()
  async getAll(@CurrentUser() user: AuthUser) {
    const [posts, count] = await this.postsService.getAll(user.id);
    return {
      message: 'posts retrieved',
      meta: {
        itemsCount: count,
      },
      data: posts,
    };
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const post = await this.postsService.getById(user.id, id);
    return {
      message: 'post retrieved',
      data: post,
    };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.postsService.delete(user.id, id);
    return {
      message: 'post deleted',
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    await this.postsService.update(user.id, id, dto);
    return {
      message: 'post updated',
    };
  }
}
