import { MinLength, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @IsString()
  @MinLength(2)
  @ApiProperty({ description: 'Имя пользователя', example: 'Artsiom' })
  name!: string;

  @IsString()
  @IsEmail()
  @MinLength(2)
  @ApiProperty({
    description: 'Электронная почта',
    example: 'example@gmail.com',
  })
  email!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'Пароль пользователя', example: 'Password' })
  password!: string;
}
