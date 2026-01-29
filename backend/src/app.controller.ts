import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  welcome(@Res() response: Response) {
    response.render('index.html', {
      name: 'Ahmad Subhan',
    });
  }

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
