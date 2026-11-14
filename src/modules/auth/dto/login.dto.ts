import { IsEmail, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsString()
  @ApiProperty({
    description: 'Электронная почта',
    example: 'example@gmail.com',
  })
  email!: string;

  @IsString()
  @ApiProperty({ description: 'Пароль', example: 'Password' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов в длину' })
  password!: string;
}
