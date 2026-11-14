import { IsEmail, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsString()
  @ApiProperty()
  email!: string;

  @IsString()
  @ApiProperty()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов в длину' })
  password!: string;
}
