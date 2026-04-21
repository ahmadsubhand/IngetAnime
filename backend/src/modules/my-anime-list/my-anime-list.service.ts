import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cryptoRandomString from 'crypto-random-string';
import {
  MalError,
  MalProfile,
  MalToken,
  MalStatusRequest,
  MalStatus,
  AllMalAnime,
  AllMalStatus,
  MalAnime,
} from './my-anime-list.model';
import { PrismaService } from '../../common/prisma.service';
import { ImportAnimeListFromMal } from '../user/user.validation';
import dayjs from 'dayjs';
import {
  Anime as AnimePrisma,
  AnimePlatform as AnimePlatformPrisma,
  UserAnimeList as UserAnimeListPrisma,
  Platform as PlatformPrisma,
  Link as LinkPrisma,
} from '../../generated/prisma/client';
import { animeInclude, dateToISOString } from '../../utils/model-formatter';

@Injectable()
export class MyAnimeListService {
  private CODE_CHALLENGE: string;
  private CLIENT_ID: string;
  private CLIENT_SECRET: string;
  private REDIRECT_URI: string;
  public MIN_FIELDS: string =
    'id,title,main_picture,alternative_titles,start_date,num_episodes,status,my_list_status,';

  constructor(
    config: ConfigService,
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

  async importMalAnimeToDatabase(
    animeFromMAL: AllMalAnime['data'],
  ): Promise<{ count: number; allMalId: number[] }> {
    // Preparing for insert new anime
    const allMalId = animeFromMAL.map((anime) => anime.node.id);
    const existingAnime = await this.prisma.anime.findMany({
      where: {
        malId: {
          in: allMalId,
        },
      },
    });
    const existingIds = new Set(existingAnime.map((anime) => anime.malId));
    const newAnime = animeFromMAL.filter(
      (anime) => !existingIds.has(anime.node.id),
    );

    // Add anime if not already in database
    if (newAnime.length > 0) {
      const results = await this.prisma.anime.createMany({
        data: newAnime.map((anime) => {
          return {
            malId: anime.node.id,
            picture: anime.node.main_picture
              ? anime.node.main_picture.large
              : 'https://ik.imagekit.io/hq9ajk99t/_Pngtree_no%20image%20vector%20illustration%20isolated_4979075.png?updatedAt=1749865837127',
            title: anime.node.title,
            titleEN: anime.node.alternative_titles?.en,
            releaseAt: dateToISOString(anime.node.start_date),
            episodeTotal: anime.node.num_episodes,
            status: anime.node.status,
          };
        }),
        skipDuplicates: true,
      });

      return { ...results, allMalId };
    } else {
      return { count: 0, allMalId };
    }
  }

  async insertAnimePlatformsToAnime(
    animeFromMAL: AllMalAnime['data'],
    userId?: number,
  ): Promise<
    (AnimePrisma &
      MalAnime & {
        animePlatforms: (AnimePlatformPrisma & {
          platform: PlatformPrisma;
          link: LinkPrisma;
        })[];
        userAnimeList: UserAnimeListPrisma[];
      })[]
  > {
    const { allMalId } = await this.importMalAnimeToDatabase(animeFromMAL);
    const animeFromDatabase = await this.prisma.anime.findMany({
      where: {
        malId: { in: allMalId },
      },
      include: animeInclude(userId),
    });

    const animeMap = new Map(
      animeFromDatabase.map((anime) => [anime.malId, anime]),
    );

    return [...animeFromMAL].map((anime) => {
      const malAnime = anime.node;
      const databaseAnime = animeMap.get(anime.node.id);
      if (!databaseAnime) {
        throw new Error(
          `Anime with malId ${anime.node.id} not found in database`,
        );
      }
      return {
        ...databaseAnime,
        ...malAnime,
        id: databaseAnime.id,
      };
    });
  }

  async updateMalStatus(
    userId: number,
    malId: number,
    data: MalStatusRequest,
  ): Promise<MalStatus> {
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
    const result = (await response.json()) as MalStatus | MalError;
    if ('error' in result) {
      throw new BadRequestException(
        result.hint || result.message || result.error,
      );
    }

    return result;
  }

  async getAllMalStatus(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<AllMalStatus> {
    const accessToken = await this.getMalConnection(userId);
    if (!accessToken) {
      throw new ForbiddenException('Account not connected to MyAnimeList');
    }

    const url = 'https://api.myanimelist.net/v2/users/@me/animelist';
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      fields: this.MIN_FIELDS,
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const listFromMal = (await response.json()) as AllMalAnime | MalError;
    if ('error' in listFromMal) {
      throw new BadRequestException(
        listFromMal.hint || listFromMal.message || listFromMal.error,
      );
    }

    await this.importMalAnimeToDatabase(listFromMal.data);

    return {
      my_list_status: [...listFromMal.data].map((anime) => {
        if (!anime.node.my_list_status) {
          throw new NotFoundException(
            'User anime list from MyAnimeList not found',
          );
        }
        return {
          ...anime.node.my_list_status,
          malId: anime.node.id,
        };
      }),
      ...((listFromMal.paging?.prev || listFromMal.paging?.next) && {
        paging: {
          prev: listFromMal.paging.prev,
          next: listFromMal.paging.next,
        },
      }),
    };
  }

  async deleteMalStatus(userId: number, malId: number): Promise<MalStatus> {
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
    const result = (await response.json()) as MalStatus | MalError;
    if ('error' in result) {
      throw new BadRequestException(
        result.hint || result.message || result.error,
      );
    }

    return result;
  }

  async importAllMalStatusToDatabase(
    userAnimeListFromMal: AllMalStatus['my_list_status'],
    userId: number,
    data: ImportAnimeListFromMal,
  ): Promise<{ count: number }> {
    const allMalId = userAnimeListFromMal.map((list) => list.malId);
    const animeFromDatabase = await this.prisma.anime.findMany({
      where: {
        malId: { in: allMalId },
      },
      include: {
        userAnimeList: {
          where: { userId },
        },
      },
    });

    const userAnimeListFromMalMap = new Map(
      userAnimeListFromMal.map((list) => [list.malId, list]),
    );

    const createFormattedData = (
      myListStatusFromMal: MalStatus,
      anime: { id: number },
    ) => {
      return {
        userId,
        animeId: anime.id,
        startDate: dateToISOString(myListStatusFromMal.start_date),
        finishDate: dateToISOString(myListStatusFromMal.finish_date),
        progress: myListStatusFromMal.num_episodes_watched,
        score: myListStatusFromMal.score,
        status: myListStatusFromMal.status,
        updatedAt: dayjs(myListStatusFromMal.updated_at).toISOString(),
        isSyncedWithMal: data.isSyncedWithMal,
      };
    };

    let result: { count: number };
    if (data.importType === 'skip_duplicates') {
      result = await this.prisma.userAnimeList.createMany({
        data: animeFromDatabase.map((anime) => {
          const myListStatusFromMal = userAnimeListFromMalMap.get(anime.malId);
          if (!myListStatusFromMal) {
            throw new Error(
              `Anime with malId ${anime.malId} not found in database`,
            );
          }
          return createFormattedData(myListStatusFromMal, anime);
        }),
        skipDuplicates: true,
      });
    } else {
      let resultLength = 0;
      await Promise.all(
        animeFromDatabase.map((anime) => {
          const myListStatusFromMal = userAnimeListFromMalMap.get(anime.malId);
          if (!myListStatusFromMal) {
            throw new Error(
              `Anime with malId ${anime.malId} not found in database`,
            );
          }
          if (data.importType === 'overwrite_all') {
            resultLength += 1;
            return this.prisma.userAnimeList.upsert({
              where: {
                userId_animeId: { userId, animeId: anime.id },
              },
              update: createFormattedData(myListStatusFromMal, anime),
              create: createFormattedData(myListStatusFromMal, anime),
            });
          } else if (data.importType === 'latest_updated') {
            const isShouldUpdate =
              !anime.userAnimeList[0]?.updatedAt ||
              dayjs(myListStatusFromMal.updated_at).isAfter(
                dayjs(anime.userAnimeList[0].updatedAt),
              );
            if (isShouldUpdate) resultLength += 1;
            return this.prisma.userAnimeList.upsert({
              where: {
                userId_animeId: { userId, animeId: anime.id },
              },
              update: isShouldUpdate
                ? createFormattedData(myListStatusFromMal, anime)
                : {},
              create: createFormattedData(myListStatusFromMal, anime),
            });
          }

          return Promise.resolve(null);
        }),
      );
      result = { count: resultLength };
    }

    return result;
  }

  async getMalAnimeDetails(
    malId: number,
    fields: string,
    userId?: number,
  ): Promise<MalAnime> {
    const accessToken = await this.getMalConnection(userId);
    const url = `https://api.myanimelist.net/v2/anime/${malId}`;
    const params = new URLSearchParams({
      fields: `${this.MIN_FIELDS}${fields}`,
    });
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : { 'X-MAL-CLIENT-ID': this.CLIENT_ID }),
      },
    });

    const animeFromMal = (await response.json()) as MalAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    return animeFromMal;
  }
}
