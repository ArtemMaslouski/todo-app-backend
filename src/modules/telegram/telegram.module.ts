import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [UserModule, TaskModule],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class TelegramModule {}
