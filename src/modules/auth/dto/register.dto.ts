import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Имя пользователя', example: 'Artsiom' })
  name!: string;

  @IsEmail()
  @IsString()
  @ApiProperty({
    description: 'Электронная почта',
    example: 'example@gmail.com',
  })
  email!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'Пароль', example: 'Password' })
  password!: string;
}
