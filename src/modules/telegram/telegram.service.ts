import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { UserService } from '../user/user.service';
import { TaskService } from '../task/task.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);
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
    this.bot.start((ctx) => this.handleStart(ctx));
    this.bot.command('tasks', (ctx) => this.handleGetTasks(ctx));
    this.bot.command('login', (ctx) => this.handleLogin(ctx));
    this.bot.launch();
    console.log('Telegram bot started');
  }

  private async handleStart(ctx) {
    return ctx.reply(
      'Привет! Я твой Todo-бот.\n\n' +
        'Доступные команды:\n' +
        '/login email пароль - Войти\n' +
        '/tasks - Мои задачи\n' +
        '/create - Создать задачу',
    );
  }

  private async handleGetTasks(ctx) {
    try {
      const chatId = ctx.chat.id.toString();
      if (!chatId) return;

      const user = await this.userService.findByTelegramChatId(chatId);
      if (!user) {
        return ctx.reply(
          'Вы не авторизованы. Напишите /login ваш_email ваш_пароль',
        );
      }

      const tasks = await this.taskService.getTaskByUserId(user.id!);
      if (!tasks || tasks.length === 0) {
        return ctx.reply('У вас пока нет задач. Создайте первую: /create');
      }

      const taskList = tasks
        .map(
          (task, i) =>
            `<b>${i + 1}. ${task.title}</b>\n` +
            `📝 ${task.description || 'Без описания'}\n` +
            `📅 ${task.date || 'Без даты'} ⏰ ${task.time || 'Без времени'}`,
        )
        .join('\n➖➖➖➖➖➖➖➖\n');
      return ctx.reply(`📋 <b>Ваши задачи:</b>\n\n${taskList}`, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async handleLogin(ctx) {
    try {
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
    } catch (error) {
      this.logger.error('Ошибка в handleLogin', error);
      ctx.reply('При входе произошла ошибка');
    }
  }
}
