import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

@Injectable()
export class CookieService {
  private readonly cookieOptions: CookieOptions;

  constructor(private config: ConfigService) {
    const environment = this.config.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );
    this.cookieOptions = {
      httpOnly: true,
      secure: environment === 'production',
      sameSite: environment === 'production' ? 'none' : 'strict',
    };
  }

  setCookie(res: Response, name: string, token: string, maxAge?: number) {
    res.cookie(name, token, {
      ...this.cookieOptions,
      maxAge,
    });
  }

  clearCookie(res: Response, name: string) {
    res.clearCookie(name, {
      ...this.cookieOptions,
    });
  }
}
