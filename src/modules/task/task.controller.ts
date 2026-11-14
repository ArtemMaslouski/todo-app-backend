import {
  Controller,
  Post,
  Body,
  Get,
  ParseIntPipe,
  Param,
  Put,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { ReplaceTaskDTO } from './dto/replace-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDTO } from './dto/create-task.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Задачи')
@ApiBearerAuth('access-token')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('getAllTasks')
  @ApiOperation({ summary: 'Получить весь список задач' })
  getAllTasks(@Request() req) {
    return this.taskService.findAll(req.user.id);
  }

  @Post('createTask')
  @ApiOperation({ summary: 'Создать задачу' })
  async createTask(@Body() createTask: CreateTaskDTO, @Request() req) {
    return this.taskService.createTask(createTask, req.user.id);
  }

  @Put('replaceTask/:id')
  @ApiOperation({ summary: 'Полностью изменить задачу по ее id' })
  async replaceTask(
    @Body() task: ReplaceTaskDTO,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.taskService.replaceTask(id, req.user.id, task);
  }

  @Patch('updateTask/:id')
  @ApiOperation({ summary: 'Частично изменить задачу по ее id' })
  async updateTask(
    @Body() task: UpdateTaskDTO,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.taskService.updateTask(id, req.user.id, task);
  }
}
