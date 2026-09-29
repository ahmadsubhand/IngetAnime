import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { doubleCsrf } from 'csrf-csrf';
import type { Request, Response, RequestHandler, NextFunction } from 'express';
import { JwtPayload } from '../types';

@Injectable()
export class CsrfService {
  private generateCsrfToken: (req: Request, res: Response) => string;
  private doubleCsrfProtection: RequestHandler;

  constructor(configService: ConfigService) {
    const environment = configService.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );
    const csrfSecret = configService.getOrThrow<string>('CSRF_SECRET');

    const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
      cookieName:
        environment === 'production' ? '__Host-x-csrf-token' : 'x-csrf-token',
      getSecret: () => csrfSecret,
      getSessionIdentifier: (req: Request & { user?: JwtPayload }) => {
        const user = req.user;
        return user?.sub?.toString() ?? 'anonymous';
      },
      cookieOptions: {
        httpOnly: true,
        secure: environment === 'production',
        sameSite: environment === 'production' ? 'none' : 'strict',
      },
      getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
    });

    this.generateCsrfToken = generateCsrfToken;
    this.doubleCsrfProtection = doubleCsrfProtection;
  }

  generate(req: Request, res: Response): string {
    return this.generateCsrfToken(req, res);
  }

  protect(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      this.doubleCsrfProtection(req, res, (err: unknown) => {
        if (err) {
          throw new ForbiddenException('invalid csrf token');
        }
        next();
      });
    };
  }
}
