import { IsString, Length } from 'class-validator';
import { NormalizeString } from '.';

export class CreatePostDto {
  @IsString()
  @NormalizeString()
  @Length(2, 2048)
  content: string;
}
