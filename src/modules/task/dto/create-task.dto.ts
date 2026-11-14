import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDTO {
  @IsString()
  @ApiProperty()
  title!: string;

  @IsString()
  @ApiProperty()
  description!: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  date!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'time должен быть в формате HH:MM:SS',
  })
  @IsString()
  @ApiProperty()
  time!: string;
}
