import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { User } from '../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { JwtPayload } from '../types';

dayjs.extend(duration);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user || user.password !== password) {
      throw new NotFoundException('Email or password is invalid');
    }

    return user;
  }

  login(user: User, res: Response): User {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    const environment = this.configService.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: environment === 'production',
      sameSite: environment === 'production' ? 'none' : 'strict',
      maxAge: dayjs.duration(28, 'days').asMilliseconds(),
    });

    return user;
  }
}
