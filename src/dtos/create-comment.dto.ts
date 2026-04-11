import { IsString, Length } from 'class-validator';
import { NormalizeString } from '.';

export class CreateCommentDto {
  @IsString()
  @NormalizeString()
  @Length(1, 1024)
  content: string;
}
