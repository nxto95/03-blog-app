import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { RepliesModule } from './replies/replies.module';
import { DashboardModule } from './dashboard/dashboard.module';
import database from './config/database';
import schema from './config/schema';
import redis from './config/redis';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, redis],
      validationSchema: schema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getOrThrow('database'),
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    RepliesModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = config.getOrThrow('redis');
        return new Redis({
          host: redis.host,
          port: redis.port,
          password: redis.password,
        });
      },
    },
  ],
})
export class AppModule {}
