import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PrismaService } from './common/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { CsrfService } from './common/csrf.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(
    private prisma: PrismaService,
    private csrf: CsrfService,
  ) {}

  // Template engine test
  @Get()
  welcome(@Res() response: Response) {
    response.render('index', {
      name: 'Ahmad Subhan',
    });
  }

  // Prisma test
  @Get('/hello')
  async getHello(): Promise<{ data: { id: number; username: string } }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: 1,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      data: {
        id: user.id,
        username: user.username,
      },
    };
  }

  @Get('/csrf-token')
  getCsrf(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return {
      csrfToken: this.csrf.generate(req, res),
    };
  }

  @Post('/csrf-test')
  @HttpCode(HttpStatus.OK)
  testCsrf() {
    return {
      message: 'csrf token valid',
    };
  }

  @Get('/auth/profile')
  @UseGuards(AuthGuard('jwt'))
  get(@Req() req: Request) {
    return req.user;
  }
}
