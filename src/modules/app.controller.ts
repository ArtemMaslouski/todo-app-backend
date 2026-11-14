import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getGoodbye(): string {
    return this.appService.getGoodbye();
  }

  @Get()
  getResponse(): string {
    return this.appService.getResponse();
  }

  @Post('post')
  postMessage(): string {
    return this.appService.postMessage();
  }
}
