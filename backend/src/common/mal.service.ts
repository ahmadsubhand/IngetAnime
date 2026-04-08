import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cryptoRandomString from 'crypto-random-string';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  MalError,
  MalProfile,
  MalToken,
  MalStatusRequest,
  MalStatusResponse,
} from '../types/mal';
import { PrismaService } from './prisma.service';

@Injectable()
export class MalService {
  private CODE_CHALLENGE: string;
  private CLIENT_ID: string;
  private CLIENT_SECRET: string;
  private REDIRECT_URI: string;

  constructor(
    config: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
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

  async getMalConnection(userId?: number): Promise<string | undefined> {
    if (!userId) {
      return undefined;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        malAccessToken: true,
        malRefreshToken: true,
      },
    });

    if (!user || !user.malAccessToken || !user.malRefreshToken) {
      return undefined;
    }

    try {
      // Check token validity
      await this.getProfile(user.malAccessToken);
      return user.malAccessToken;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        const { access_token, refresh_token } = await this.getNewAccessToken(
          user.malRefreshToken,
        );

        await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            malAccessToken: access_token,
            malRefreshToken: refresh_token,
          },
        });

        return access_token;
      }
    }
  }

  async updateMalStatus(
    userId: number,
    malId: number,
    data: MalStatusRequest,
  ): Promise<MalStatusResponse> {
    const accessToken = await this.getMalConnection(userId);
    if (!accessToken) {
      throw new ForbiddenException('Account not connected to MyAnimeList');
    }

    const { status, num_watched_episodes, score, start_date, finish_date } =
      data;

    const url = `https://api.myanimelist.net/v2/anime/${malId}/my_list_status`;
    const params = new URLSearchParams({
      ...(status && { status }),
      ...((num_watched_episodes === 0 || num_watched_episodes) && {
        num_watched_episodes: num_watched_episodes.toString(),
      }),
      ...((score === 0 || score) && {
        score: score.toString(),
      }),
      ...(start_date === null
        ? { start_date: '0000-00-00' }
        : start_date && { start_date }),
      ...(finish_date === null
        ? { finish_date: '0000-00-00' }
        : finish_date && { finish_date }),
    });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${accessToken}`,
      },
      body: params.toString(),
    });
    const result = (await response.json()) as MalStatusResponse | MalError;
    if ('error' in result) {
      throw new BadRequestException(
        result.hint || result.message || result.error,
      );
    }

    return result;
  }

  async deleteMalStatus(
    userId: number,
    malId: number,
  ): Promise<MalStatusResponse> {
    const accessToken = await this.getMalConnection(userId);
    if (!accessToken) {
      throw new ForbiddenException('Account not connected to MyAnimeList');
    }

    const url = `https://api.myanimelist.net/v2/anime/${malId}/my_list_status`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const result = (await response.json()) as MalStatusResponse | MalError;
    if ('error' in result) {
      throw new BadRequestException(
        result.hint || result.message || result.error,
      );
    }
    console.log(result);

    return result;
  }
}
