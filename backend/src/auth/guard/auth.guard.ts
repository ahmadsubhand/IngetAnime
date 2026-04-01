import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../../types';

@Injectable()
abstract class BaseGuard implements CanActivate {
  private cookieName: string;
  constructor(
    config: ConfigService,
    private jwt: JwtService,
  ) {
    const environment = config.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );
    this.cookieName =
      environment === 'production' ? '__Host-x-access-token' : 'x-access-token';
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      if (this.isAuthOptional()) return true;
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      request['user'] = payload;
      return true;
    } catch {
      if (this.isAuthOptional()) return true;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.cookies?.[this.cookieName] as string | undefined;
    return token;
  }

  protected abstract isAuthOptional(): boolean;
}

@Injectable()
export class AuthGuard extends BaseGuard {
  protected isAuthOptional(): boolean {
    return false;
  }
}

@Injectable()
export class OptionalAuthGuard extends BaseGuard {
  protected isAuthOptional(): boolean {
    return true;
  }
}
