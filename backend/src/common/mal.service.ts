import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cryptoRandomString from 'crypto-random-string';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MalError, MalProfile, MalToken } from '../types';

@Injectable()
export class MalService {
  private CODE_CHALLENGE: string;
  private CLIENT_ID: string;
  private CLIENT_SECRET: string;
  private REDIRECT_URI: string;

  constructor(
    config: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {
    this.CODE_CHALLENGE = cryptoRandomString({
      length: 64,
      type: 'url-safe',
    });
    this.CLIENT_ID = config.getOrThrow('MAL_CLIENT_ID');
    this.CLIENT_SECRET = config.getOrThrow('MAL_CLIENT_SECRET');

    const baseUrl = config.get<string>('BASE_URL', 'http://localhost');
    const port = config.get<number>('PORT', 3000);
    this.REDIRECT_URI = `${baseUrl}:${port}/auth/mal/callback`;
  }

  generateAuthUrl(state?: string): string {
    const url = new URL('https://myanimelist.net/v1/oauth2/authorize');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      code_challenge: this.CODE_CHALLENGE,
      code_challenge_method: 'plain',
      ...(state && {
        state,
      }),
    });
    return `${url}?${params.toString()}`;
  }

  async getToken(code: string): Promise<MalToken> {
    try {
      const url = 'https://myanimelist.net/v1/oauth2/token';
      const params = new URLSearchParams({
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: this.REDIRECT_URI,
        code_verifier: this.CODE_CHALLENGE,
        code,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      const data = (await response.json()) as MalToken | MalError;
      if ('error' in data) {
        throw new BadRequestException(data.hint || data.message || data.error);
      }
      return data;
    } catch (err: unknown) {
      this.logger.warn(err);
      throw new HttpException(`Failed to get MyAnimeList token`, 500);
    }
  }

  async getProfile(accessToken: string): Promise<MalProfile> {
    try {
      const url = 'https://api.myanimelist.net/v2/users/@me';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = (await response.json()) as MalProfile | MalError;
      if ('error' in data) {
        if (data.error === 'invalid_token') {
          throw new UnauthorizedException('MAL access token unauthorized');
        }
        throw new BadRequestException(data.hint || data.message || data.error);
      }
      return data;
    } catch (err) {
      this.logger.warn(err);
      throw new HttpException('Failed to connet to MyAnimeList API', 500);
    }
  }

  async getNewAccessToken(refreshToken: string): Promise<MalToken> {
    try {
      const url = 'https://myanimelist.net/v1/oauth2/token';
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      const credentials = Buffer.from(
        `${process.env.MAL_CLIENT_ID}:${process.env.MAL_CLIENT_SECRET}`,
      ).toString('base64');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        body: params.toString(),
      });
      const data = (await response.json()) as MalToken | MalError;
      if ('error' in data) {
        if (data.error === 'invalid_token') {
          throw new UnauthorizedException('MAL refresh token unauthorized');
        }
        throw new BadRequestException(data.hint || data.message || data.error);
      }
      return data;
    } catch (err: unknown) {
      this.logger.warn(err);
      throw new HttpException(`Failed to get MyAnimeList token`, 500);
    }
  }
}
