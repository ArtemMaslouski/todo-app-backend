import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { UserService } from '../user/user.service';
import { TaskService } from '../task/task.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private taskService: TaskService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN не найден');
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    this.bot.start((ctx) => {
      ctx.reply(
        'Привет! Я твой Todo-бот.\n\nЧтобы я мог показать твои задачи, войди в аккаунт командой:\n/login твой_email твой_пароль\n\nПример: /login test@mail.com 123456',
      );
    });

    this.bot.command('tasks', async (ctx) => {
      try {
        const chatId = ctx.chat.id.toString();

        const user = await this.userService.findByTelegramChatId(chatId);

        const tasks = await this.taskService.getTaskByUserId(user?.id);

        tasks.map((task) => {
          ctx.reply(
            `<b>Задача:</b>${task.title}\n<b>Описание задачи:</b>${task.description}\n<b>Дата:</b>${task.date}\n<b>Время исполнения:${task.time}</b>`,
            {
              parse_mode: 'HTML',
            },
          );
        });
      } catch {
        throw new Error();
      }
    });

    this.bot.command('login', async (ctx) => {
      const message = ctx.message.text.replace('/login', '').trim();
      const [email, password] = message.split(/\s+/);

      if (!email || !password) {
        return ctx.reply(
          'Ошибка. Соблюдайте рекомендуемый формат: /login твой_email твой_пароль',
        );
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        return ctx.reply('Ошибка. Пользователь не найден');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return ctx.reply('Неверный пароль');
      }

      await this.userService.update(user.id!, {
        telegramChatId: ctx.chat.id.toString(),
      });

      return ctx.reply(
        `✅Успешный вход! Привет, ${user.name}.\nТеперь напиши /tasks, чтобы посмотреть задачи.`,
        { parse_mode: 'HTML' },
      );
    });
    this.bot.launch();
    console.log('Telegram bot started');
  }
}
