import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { UserResponse } from '../types';
import bcrypt from 'bcrypt';
import cryptoRandomString from 'crypto-random-string';
import { Prisma } from '../generated/prisma/client';
import { MailService } from '../common/mail.service';

dayjs.extend(duration);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  // Helper function

  toUserData(user: UserResponse): UserResponse {
    return {
      id: user.id,
      username: user.username,
      picture: user.picture,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
    };
  }

  userSelect() {
    return {
      id: true,
      username: true,
      picture: true,
      role: true,
      email: true,
      isVerified: true,
    };
  }

  maskString(string: string) {
    const length = string.length;
    if (length <= 2) {
      return string[0] + '*'.repeat(length - 1);
    } else if (length <= 3) {
      return string[0] + '*'.repeat(length - 2) + string.slice(-1);
    } else {
      return string.slice(0, 2) + '*'.repeat(length - 3) + string.slice(-1);
    }
  }

  async findUniqueUsername(email: string) {
    const base = email.split('@')[0];
    let suffix = 0;
    while (true) {
      const candidateUsername = suffix === 0 ? base : `${base}${suffix}`;
      const isUsernameExists = await this.prisma.user.count({
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

  // API function

  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<UserResponse> {
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
        select: this.userSelect(),
      });

      await this.mail.sendEmail(
        email,
        'IngetAnime - Email Verification',
        'otp-register',
        { otp: otpCode },
      );

      return user;
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
      select: {
        ...this.userSelect(),
        password: true,
      },
    });

    const isPasswordValid = user?.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throw new NotFoundException('Email or password is invalid');
    }

    // Remove password
    return this.toUserData(user);
  }

  async verifyEmail(id: number, otpCode: string): Promise<UserResponse> {
    const otpExpiration = (
      await this.prisma.user.findUnique({
        where: {
          id,
          otpCode,
        },
        select: {
          otpExpiration: true,
        },
      })
    )?.otpExpiration;
    if (!otpExpiration) {
      throw new BadRequestException('Invalid token or account');
    }

    const isOTPExpired = dayjs().isAfter(dayjs(otpExpiration));
    if (isOTPExpired) {
      throw new BadRequestException('Token has expired');
    }

    const user = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isVerified: true,
      },
      select: this.userSelect(),
    });

    return user;
  }

  async resendVerification(id: number): Promise<{ email: string }> {
    const otpCode = cryptoRandomString({ length: 6, type: 'numeric' });
    const otpExpiration = dayjs().add(10, 'minute').toISOString();
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        otpCode,
        otpExpiration,
      },
      select: {
        email: true,
      },
    });

    if (!user.email) {
      throw new NotFoundException('Email address not found');
    }

    await this.mail.sendEmail(
      user.email,
      'IngetAnime - Email Verification',
      'otp-register',
      { otp: otpCode },
    );

    const [local, domain] = user.email.split('@');
    const maksedEmail = `${this.maskString(local)}@${domain}`;

    return {
      email: maksedEmail,
    };
  }
}
