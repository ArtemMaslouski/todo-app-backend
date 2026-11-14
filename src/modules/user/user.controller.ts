import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Put,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ReplaceUserDTO } from './dto/replace-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Пользователь')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('findAll')
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post('createUser')
  @ApiOperation({ summary: 'Создать пользователя' })
  async createUser(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    return this.userService.createUser(createUserDTO);
  }

  @Put('replaceUser/:id')
  @ApiOperation({ summary: 'Полностью изменить пользователя по его id' })
  async replaceUser(
    @Body() replaceUserDTO: ReplaceUserDTO,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    return await this.userService.replaceUser(id, replaceUserDTO);
  }

  @Patch('updateUser/:id')
  @ApiOperation({ summary: 'Частично изменить пользователя по его id' })
  async updateUser(
    @Body() updateUserDTO: UpdateUserDTO,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UpdateUserDTO> {
    return await this.userService.patchUser(id, updateUserDTO);
  }
}
