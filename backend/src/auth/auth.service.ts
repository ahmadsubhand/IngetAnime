import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { JwtPayload, UserResponse } from '../types';
import bcrypt from 'bcrypt';
import cryptoRandomString from 'crypto-random-string';
import { Prisma, type User } from '../generated/prisma/client';
import { MailService } from '../common/mail.service';

dayjs.extend(duration);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  // Helper function

  toUserData(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      picture: user.picture,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
    };
  }

  async findUniqueUsername(email: string) {
    const base = email.split('@')[0];
    let suffix = 0;
    while (true) {
      const candidateUsername = suffix === 0 ? base : `${base}${suffix}`;
      const isUsernameExists = await this.prisma.user.findUnique({
        where: {
          username: candidateUsername,
        },
      });
      if (!isUsernameExists) {
        return candidateUsername;
      }
      suffix++;
    }
  }

  setAccessToken(user: { username: string; id: number }, res: Response) {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    const token = this.jwt.sign(payload);
    const environment = this.config.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: environment === 'production',
      sameSite: environment === 'production' ? 'none' : 'strict',
      maxAge: dayjs.duration(28, 'days').asMilliseconds(),
    });
  }

  // API function

  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<UserResponse> {
    // // Generate unique username
    // if (!username) {
    //   username = await this.findUniqueUsername(email);
    // }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const otpCode = cryptoRandomString({ length: 6, type: 'numeric' });
      const otpExpiration = dayjs().add(10, 'minute').toISOString();
      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          otpCode,
          otpExpiration,
        },
      });

      await this.mail.sendEmail(
        email,
        'IngetAnime - Email Verification',
        'otp-register',
        { otp: otpCode },
      );

      return this.toUserData(user);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Username or email already in use');
      }

      throw err;
    }
  }

  async login(identifier: string, password: string): Promise<UserResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    const isPasswordValid = user?.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throw new NotFoundException('Email or password is invalid');
    }

    return this.toUserData(user);
  }

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
}
