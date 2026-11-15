import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReplaceUserDTO } from './dto/replace-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(dto: CreateUserDTO): Promise<User> {
    const result = this.userRepository.create(dto);
    return this.userRepository.save(result);
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Пользователь не найден');
    }
  }

  async patchUser(
    id: number,
    updateUserDTO: UpdateUserDTO,
  ): Promise<UpdateUserDTO> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    Object.assign(user, updateUserDTO);

    return this.userRepository.save(user);
  }

  async replaceUser(id: number, replaceUserDTO: ReplaceUserDTO): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updatedUser = this.userRepository.create({
      ...user,
      ...replaceUserDTO,
    });

    return this.userRepository.save(updatedUser);
  }

  async update(id: number, updatedData: Partial<User>) {
    await this.userRepository.update(id, updatedData);

    return this.findOneById(id);
  }

  async findOneById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
}
