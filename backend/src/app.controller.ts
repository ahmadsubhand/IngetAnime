import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PrismaService } from './common/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { ZodValidationPipe } from './common/zod-validation.pipe';
import { AuthValidation } from './auth/auth.validation';
import type { Login } from './auth/auth.validation';
import { CsrfService } from './common/csrf.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(
    private prisma: PrismaService,
    private service: AuthService,
    private csrfService: CsrfService,
  ) {}

  // Template engine test
  @Get()
  welcome(@Res() response: Response) {
    response.render('index.html', {
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
      csrfToken: this.csrfService.generate(req, res),
    };
  }

  @Post('/csrf-test')
  csrf() {
    return {
      message: 'csrf token valid',
    };
  }

  @Post('/auth/login')
  @HttpCode(200)
  @SkipThrottle({ default: false })
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
