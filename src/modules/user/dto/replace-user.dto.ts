import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplaceUserDTO {
  @IsString()
  @MinLength(2)
  @ApiProperty({ description: 'Имя пользователя', example: 'Artsiom' })
  name!: string;

  @IsString()
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
