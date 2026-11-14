import { MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  name!: string;

  @IsString()
  @MinLength(2)
  @ApiProperty()
  email!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty()
  password!: string;
}
