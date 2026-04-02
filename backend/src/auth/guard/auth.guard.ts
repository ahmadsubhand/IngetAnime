import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtService } from '../../common/jwt.service';

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
      const data = await this.jwt.verifyToken(token, 'access_token');
      request['user'] = data;
      return true;
    } catch (error) {
      if (this.isAuthOptional()) return true;
      throw error;
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
