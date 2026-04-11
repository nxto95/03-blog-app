import { IsString, Length } from 'class-validator';
import { NormalizeString } from '.';

export class CreateReplyDto {
  @IsString()
  @NormalizeString()
  @Length(1, 512)
  content: string;
}
