export * from './create-user.dto';
export * from './create-post.dto';
export * from './create-comment.dto';
export * from './create-reply.dto';
export * from './update-post.dto';
export * from './update-comment.dto';
export * from './update-reply.dto';

import { Transform } from 'class-transformer';
export function NormalizeString() {
  return Transform(({ value }): string =>
    typeof value === 'string' ? value.trim().toLocaleLowerCase() : value,
  );
}
