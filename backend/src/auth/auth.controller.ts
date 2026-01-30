import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  redirectGoogle() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  loginGoogle(@Req() req: Request) {
    return {
      data: req.user,
    };
  }
}
