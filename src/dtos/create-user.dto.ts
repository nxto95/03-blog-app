import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { NormalizeString } from '.';

export class CreateUserDto {
  @NormalizeString()
  @IsString()
  @IsOptional()
  @Length(2, 55)
  username?: string;
  @IsEmail()
  email: string;
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;
}
