import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { UserService } from '../user/user.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN не найден');
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    this.bot.start((ctx) => {
      ctx.reply(
        'Привет! Я твой Todo-бот. Напиши /tasks, чтобы посмотреть задачи.',
      );
    });

    this.bot.command('start', async (ctx) => {
      console.log('nvksjvksj');
    });

    this.bot.command('tasks', async (ctx) => {
      const user = await this.userService.findByEmail('masloartem20@gmail.com');
      console.log(user);

      if (!user) throw new Error('Пользоватиель не найден');

      ctx.reply(
        `Привет, ${user.name}! У тебя пока нет задач (или они есть, но я их не вижу).`,
      );
    });
    this.bot.launch();
    console.log('Telegram bot started');
  }
}
