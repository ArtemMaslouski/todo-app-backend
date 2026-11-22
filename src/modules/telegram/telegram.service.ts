import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as LocalSession from 'telegraf-session-local';
import { Telegraf, Context } from 'telegraf';
import { UserService } from '../user/user.service';
import { TaskService } from '../task/task.service';
import * as bcrypt from 'bcrypt';

interface MyContext extends Context {
  session: {
    step?: 'waiting_title' | 'waiting_desc' | 'waiting_date' | 'waiting_time';
    task_Data?: {
      title?: string;
      description?: string;
      date?: string;
      time?: string;
    };
  };
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf<MyContext>;
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
    this.bot.use(new LocalSession({ database: 'sessions.json' }).middleware());
    this.bot.start((ctx) => this.handleStart(ctx));
    this.bot.command('tasks', (ctx) => this.handleGetTasks(ctx));
    this.bot.command('login', (ctx) => this.handleLogin(ctx));
    this.bot.command('create', (ctx) => this.handleCreateStart(ctx));
    this.bot.command('cancel', (ctx) => {
      this.handleCancel(ctx);
    });

    this.bot.on('text', (ctx) => this.handleTextSteps(ctx));
    this.bot.launch();
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

  private async handleCreateStart(ctx: MyContext) {
    ctx.session = { step: 'waiting_title', task_Data: {} };
    return ctx.reply(
      '📝 Введите название задачи (или напиши /cancel для отмены):',
    );
  }

  private async handleCancel(ctx: MyContext) {
    ctx.session = {};
    return ctx.reply('Создание задач отменено');
  }

  private async handleTextSteps(ctx: MyContext) {
    if (!ctx.session || !ctx.session.step) return;

    const text = (ctx.message as any)?.text || '';

    if (ctx.session.step === 'waiting_title') {
      ctx.session.task_Data!.title = text;
      ctx.session.step = 'waiting_desc';
      return ctx.reply(
        'Введите описание задачи (или напишите "-", чтобы пропустить)',
      );
    }

    if (ctx.session.step === 'waiting_desc') {
      ctx.session.task_Data!.description = text;
      ctx.session.step = 'waiting_date';
      return ctx.reply(
        'Введите дату(в формате ГГГГ-ММ-ДДб например 2026-01-01):',
      );
    }

    if (ctx.session.step === 'waiting_date') {
      ctx.session.task_Data!.date = text;
      ctx.session.step = 'waiting_time';
      return ctx.reply(
        'Введите время (в формате ЧЧ:ММ:СС, например 14:30:00):',
      );
    }

    if (ctx.session.step === 'waiting_time') {
      if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(text)) {
        return ctx.reply('Неверный формат. Введите время как 14:30:00:');
      }
      ctx.session.task_Data!.time = text;

      try {
        const chatId = ctx.chat?.id.toString();
        const user = await this.userService.findByTelegramChatId(chatId!);

        if (!user) {
          ctx.session = {};
          ctx.reply(
            'Вы не авторизованы. Напишите /login твой_email твой_пароль',
          );
          return;
        }

        await this.taskService.createTask(
          ctx.session.task_Data as any,
          user.id!,
        );
        ctx.session = {};
        return ctx.reply(
          '✅ Задача успешно создана! Напиши /tasks, чтобы проверить.',
        );
      } catch (error) {
        this.logger.error('Ошибка при создании задачи', error);
        ctx.session = {};
        return ctx.reply('❌ Ошибка при создании задачи.');
      }
    }
  }
}
