import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ReplaceTaskDTO {
  @IsString()
  @ApiProperty({
    description: 'Заголовок задачи',
    example: 'Сходить в магазин',
  })
  title!: string;

  @IsString()
  @ApiProperty({ description: 'Описание задачи', example: 'Хлеб,творог' })
  description!: string;

  @IsString()
  @ApiProperty({ description: 'Вероятная дата события', example: '' })
  date!: string;

  @IsString()
  @ApiProperty({
    description: 'Формат времени YYYY-MM-DD',
    example: '2026-12-12',
  })
  time!: string;
}
