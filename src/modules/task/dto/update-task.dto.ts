import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class UpdateTaskDTO {
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
