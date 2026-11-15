import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateTokens(userId: number, email: string, role?: string) {
    const payload = { sub: userId, email, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOneById(userId);

    if (!user || !refreshToken || !user.hashedRefreshToken) {
      throw new ForbiddenException('Доступ запрещен');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Доступ запрещен');
    }

    const tokens = await this.generateTokens(user.id!, user.email, user.role);
    await this.updateRefreshToken(user.id!, tokens.refresh_token);

    return tokens;
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;

    return await this.userService.update(userId, { hashedRefreshToken });
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

    const tokens = await this.generateTokens(user.id!, user.email, user.role);
    await this.updateRefreshToken(user.id!, tokens.refresh_token);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role },
    };
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

    const tokens = await this.generateTokens(user.id!, user.email, user.role);
    await this.updateRefreshToken(user.id!, tokens.refresh_token);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async logout(userId: number) {
    return await this.updateRefreshToken(userId, null);
  }
}
