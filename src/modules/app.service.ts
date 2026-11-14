import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Artsiom !';
  }

  getGoodbye(): string {
    return 'Goodbye, dembel is sooner than you think';
  }

  getResponse(): string {
    return 'Something about response';
  }

  postMessage(): string {
    return 'this method post a new message';
  }
}
