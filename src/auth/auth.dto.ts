import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDTO {
  @IsString()
  @IsNotEmpty()
  identity!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
