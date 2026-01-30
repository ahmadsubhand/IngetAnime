import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PrismaService } from './common/prisma.service';
import type { User } from './generated/prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { ZodValidationPipe } from './common/zod-validation.pipe';
import { AuthValidation } from './auth/auth.validation';
import type { Login } from './auth/auth.validation';

@Controller()
export class AppController {
  constructor(
    private prisma: PrismaService,
    private service: AuthService,
  ) {}
  @Get()
  welcome(@Res() response: Response) {
    response.render('index.html', {
      name: 'Ahmad Subhan',
    });
  }

  @Get('/hello')
  async getHello(): Promise<{ data: User | null }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: 1,
      },
    });

    return {
      data: user,
    };
  }

  @Post('/auth/login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(AuthValidation.Login))
  async login(
    @Body() request: Login,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.service.validateUser(
      request.username,
      request.password,
    );
    return this.service.login(user, res);
  }

  @Get('/auth/profile')
  @UseGuards(AuthGuard('jwt'))
  get(@Req() req: Request) {
    return req.user;
  }
}
