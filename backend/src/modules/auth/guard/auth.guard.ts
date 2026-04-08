import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtService } from '../../../common/jwt.service';
import { JwtPayload } from '../../../types';
import { UserResponse } from '../../../types/entity';
import { PrismaService } from '../../../common/prisma.service';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorator/role.decarator';

@Injectable()
export abstract class BaseGuard implements CanActivate {
  private cookieName: string;
  protected abstract isAuthOptional: boolean;

  constructor(
    config: ConfigService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {
    const environment = config.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );
    this.cookieName =
      environment === 'production' ? '__Host-x-access-token' : 'x-access-token';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      if (this.isAuthOptional) return true;
      throw new UnauthorizedException('Token not found');
    }

    try {
      const data = await this.jwt.verifyToken(token, 'access_token');
      request.user = data;

      const role = this.reflector.get(Role, context.getHandler());
      if (role) {
        await this.checkAuthorization(role, request.user);
      }
      return true;
    } catch (error) {
      if (this.isAuthOptional) return true;
      throw error;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.cookies?.[this.cookieName] as string | undefined;
    return token;
  }

  private async checkAuthorization(
    role: UserResponse['role'],
    user: JwtPayload,
  ) {
    const userFromDB = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
      select: {
        role: true,
      },
    });

    if (!userFromDB || role !== userFromDB.role) {
      throw new ForbiddenException('Admin only');
    }
  }
}

@Injectable()
export class AuthGuard extends BaseGuard {
  protected isAuthOptional = false;
}

@Injectable()
export class OptionalAuthGuard extends BaseGuard {
  protected isAuthOptional = true;
}
