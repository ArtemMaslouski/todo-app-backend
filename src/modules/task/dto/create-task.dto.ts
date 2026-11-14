import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDTO {
  @IsString()
  @ApiProperty({
    description: 'Заголовок задачи',
    example: 'Сходить в магазин',
  })
  title!: string;

  @IsString()
  @ApiProperty({ description: 'Описание задачи', example: 'Хлеб,творог' })
  description!: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Вероятная дата события', example: '' })
  date!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'time должен быть в формате HH:MM:SS',
  })
  @IsString()
  @ApiProperty({
    description: 'Формат времени YYYY-MM-DD',
    example: '2026-12-12',
  })
  time!: string;
}
