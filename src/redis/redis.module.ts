import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../types';

@Global()
@Module({
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
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
