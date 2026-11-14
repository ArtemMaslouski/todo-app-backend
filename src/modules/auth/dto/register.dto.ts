import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name!: string;

  @IsEmail()
  @IsString()
  @ApiProperty()
  email!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty()
  password!: string;
}
