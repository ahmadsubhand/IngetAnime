import {
  BadRequestException,
  ConflictException,
  GoneException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { User } from '../user/user.model';
import { MalProfile } from '../../types/mal';
import bcrypt from 'bcrypt';
import cryptoRandomString from 'crypto-random-string';
import { Prisma } from '../../generated/prisma/client';
import { MailService } from '../../common/mail.service';
import { ConfigService } from '@nestjs/config';
import { Login, Register, ResetPassword } from './auth.validation';
import { JwtService } from '../../common/jwt.service';
import { DateFormatterService } from '../../common/date-formatter.service';

dayjs.extend(duration);

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private jwt: JwtService,
    private config: ConfigService,
    private dateFormatter: DateFormatterService,
  ) {}

  private userSelect = {
    id: true,
    email: true,
    username: true,
    picture: true,
    isVerified: true,
    role: true,
    malId: true,
    googleId: true,
    updatedAt: true,
    createdAt: true,
  };

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

  async register(data: Register): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);
      const otpCode = cryptoRandomString({ length: 6, type: 'numeric' });
      const otpExpiration = dayjs().add(10, 'minute').toISOString();
      const user = await this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: hashedPassword,
          otpCode,
          otpExpiration,
        },
        select: this.userSelect,
      });

      await this.mail.sendEmail(
        data.email,
        'IngetAnime - Email Verification',
        'otp-register',
        { otp: otpCode },
      );

      return {
        ...user,
        malId: user.malId ? parseInt(user.malId) : null,
        googleId: user.googleId ? parseInt(user.googleId) : null,
        ...this.dateFormatter.userResponse(user.updatedAt, user.createdAt),
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Username or email already exists');
      }

      throw err;
    }
  }

  async login(data: Login): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: data.identifier }, { email: data.identifier }],
      },
      select: {
        ...this.userSelect,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;

    const isPasswordValid = password
      ? await bcrypt.compare(data.password, password)
      : false;

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid email or password');
    }

    return {
      ...userWithoutPassword,
      malId: user.malId ? parseInt(user.malId) : null,
      googleId: user.googleId ? parseInt(user.googleId) : null,
      ...this.dateFormatter.userResponse(user.updatedAt, user.createdAt),
    };
  }

  async verifyEmail(id: number, otpCode: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
          otpCode,
        },
        select: {
          otpExpiration: true,
        },
      });
      if (!user) {
        throw new BadRequestException('Invalid otp code or account');
      }

      const isOTPExpired = dayjs().isAfter(dayjs(user.otpExpiration));
      if (isOTPExpired) {
        throw new GoneException('OTP code has expired');
      }

      const verifiedUser = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          isVerified: true,
        },
        select: this.userSelect,
      });

      return {
        ...verifiedUser,
        malId: verifiedUser.malId ? parseInt(verifiedUser.malId) : null,
        googleId: verifiedUser.googleId
          ? parseInt(verifiedUser.googleId)
          : null,
        ...this.dateFormatter.userResponse(
          verifiedUser.updatedAt,
          verifiedUser.createdAt,
        ),
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
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

  async forgotPassword(
    identifier: string,
  ): Promise<{ email: string; username: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.email) {
      throw new NotFoundException('Email address not found');
    }

    const token = this.jwt.createToken(
      {
        sub: user.id,
        type: 'reset_password',
      },
      '10m',
    );
    const clientUrl = this.config.get<string>(
      'CLIENT_URL',
      'http://localhost:5173',
    );
    const resetPasswordLink = `${clientUrl}/auth/forgot-password?token=${token}`;

    await this.mail.sendEmail(
      user.email,
      'IngetAnime - Reset Password',
      'reset-password',
      { resetLink: resetPasswordLink },
    );

    const [local, domain] = user.email.split('@');
    const maksedEmail = `${this.maskString(local)}@${domain}`;
    const maskedUsername = this.maskString(user.username);

    return {
      email: maksedEmail,
      username: maskedUsername,
    };
  }

  async resetPassword(data: ResetPassword): Promise<User> {
    try {
      const payload = await this.jwt.verifyToken(data.token, 'reset_password');

      const hashedPassword = await bcrypt.hash(
        data.newPassword,
        this.SALT_ROUNDS,
      );
      const user = await this.prisma.user.update({
        where: {
          id: payload.sub,
        },
        data: {
          password: hashedPassword,
        },
        select: this.userSelect,
      });

      return {
        ...user,
        malId: user.malId ? parseInt(user.malId) : null,
        googleId: user.googleId ? parseInt(user.googleId) : null,
        ...this.dateFormatter.userResponse(user.updatedAt, user.createdAt),
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }

      throw err;
    }
  }

  async loginWithGoogle(
    googleId: string,
    email: string,
    picture?: string | null,
  ): Promise<User & { statusCode: HttpStatus }> {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
      select: this.userSelect,
    });
    let statusCode: HttpStatus = HttpStatus.OK;

    if (!user) {
      statusCode = HttpStatus.CREATED;
      user = await this.prisma.user.create({
        data: {
          username: await this.findUniqueUsername(email),
          email,
          picture: picture,
          isVerified: true,
          googleId,
        },
        select: this.userSelect,
      });
    } else {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            googleId,
            isVerified: true,
            ...(!user.picture && { picture }),
          },
          select: this.userSelect,
        });
      }
    }

    return {
      ...user,
      malId: user.malId ? parseInt(user.malId) : null,
      googleId: user.googleId ? parseInt(user.googleId) : null,
      ...this.dateFormatter.userResponse(user.updatedAt, user.createdAt),
      statusCode,
    };
  }

  async loginWithMal(
    accessToken: string,
    refreshToken: string,
    malProfile: MalProfile,
  ): Promise<User & { statusCode: HttpStatus }> {
    const malId = malProfile.id.toString();

    let user = await this.prisma.user.findFirst({
      where: {
        malId,
      },
      select: this.userSelect,
    });
    let statusCode: HttpStatus = HttpStatus.OK;

    if (!user) {
      statusCode = HttpStatus.CREATED;
      user = await this.prisma.user.create({
        data: {
          username: await this.findUniqueUsername(malProfile.name),
          picture: malProfile.picture,
          isVerified: true,
          malId,
          malAccessToken: accessToken,
          malRefreshToken: refreshToken,
        },
        select: this.userSelect,
      });
    } else {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...(!user.picture && {
            picture: malProfile.picture,
          }),
          malAccessToken: accessToken,
          malRefreshToken: refreshToken,
        },
        select: this.userSelect,
      });
    }

    return {
      ...user,
      malId: user.malId ? parseInt(user.malId) : null,
      googleId: user.googleId ? parseInt(user.googleId) : null,
      ...this.dateFormatter.userResponse(user.updatedAt, user.createdAt),
      statusCode,
    };
  }
}
