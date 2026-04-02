import {
  BadRequestException,
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
    this.REDIRECT_URI = `${config.getOrThrow('CLIENT_URL')}/auth/mal/callback`;
  }

  generateAuthUrl(state: string): string {
    const url = new URL('https://myanimelist.net/v1/oauth2/authorize');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      code_challenge: this.CODE_CHALLENGE,
      code_challenge_method: 'plain',
      state,
    });
    return `${url}?${params.toString()}`;
  }

  async getToken(code: string): Promise<MalToken> {
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
  }

  async getProfile(accessToken: string): Promise<MalProfile> {
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
        // Example: access token expired
        throw new UnauthorizedException(
          'MyAnimeList access token unauthorized',
        );
      }
      throw new BadRequestException(data.hint || data.message || data.error);
    }
    return data;
  }

  async getNewAccessToken(refreshToken: string): Promise<MalToken> {
    const url = 'https://myanimelist.net/v1/oauth2/token';
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const credentials = Buffer.from(
      `${this.CLIENT_ID}:${this.CLIENT_SECRET}`,
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
        // Example: refresh token expired
        throw new UnauthorizedException(
          'MyAnimeList refresh token unauthorized',
        );
      }
      throw new BadRequestException(data.hint || data.message || data.error);
    }

    return data;
  }
}
