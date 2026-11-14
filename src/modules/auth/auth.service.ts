import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { User } from '../user/user.entity';
import { RegisterDTO } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDTO: LoginDTO) {
    const user = await this.userService.findByEmail(loginDTO.email);

    if (!user) {
      throw new ConflictException('Не удается найти пользователя');
    }

    const passwordValid = await bcrypt.compare(
      loginDTO.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.generateToken(user);
  }

  async register(registerDTO: RegisterDTO) {
    const { name, email, password } = registerDTO;
    const isExist = await this.userService.findByEmail(email);

    if (isExist) {
      throw new ConflictException('Пользователь уже найден');
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser({
      name,
      email,
      password: hash,
    });

    return this.generateToken(user);
  }
}
