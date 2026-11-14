import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ReplaceTaskDTO {
  @IsString()
  @ApiProperty()
  title!: string;

  @IsString()
  @ApiProperty()
  description!: string;

  @IsString()
  @ApiProperty()
  date!: string;

  @IsString()
  @ApiProperty()
  time!: string;
}
