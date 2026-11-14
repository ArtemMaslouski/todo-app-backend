import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { ReplaceTaskDTO } from './dto/replace-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { CreateTaskDTO } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  findAll(userId: number): Promise<Task[]> {
    return this.taskRepository.find({ where: { userId } });
  }

  async createTask(dto: CreateTaskDTO, userId: number): Promise<CreateTaskDTO> {
    const task = await this.taskRepository.create({ ...dto, userId });
    return this.taskRepository.save(task);
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Задача не найден');
    }
  }

  async replaceTask(
    id: number,
    userId: number,
    replaceTaskDTO: ReplaceTaskDTO,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
    });
    if (!task) throw new NotFoundException('Задача не найден');

    Object.assign(task, {
      title: replaceTaskDTO.title ?? null,
      description: replaceTaskDTO.description ?? null,
      date: replaceTaskDTO.date ?? null,
      time: replaceTaskDTO.time ?? null,
    });

    return this.taskRepository.save(task);
  }

  async updateTask(
    id: number,
    userId: number,
    updateTaskDTO: UpdateTaskDTO,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
    });

    if (!task) throw new NotFoundException('Задача не найден');

    Object.assign(task, updateTaskDTO);

    return this.taskRepository.save(task);
  }
}
