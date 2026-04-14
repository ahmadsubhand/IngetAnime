import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  UserAnimeListComputed,
  UserAnimeListComputedResponse,
  UserFullResponse,
  UserResponse,
} from '../../types/entity';
import { DateFormatterService } from '../../common/date-formatter.service';
import {
  GetUserAnimeList,
  ImportAnimeListFromMal,
  UpdateUserDetail,
  UserValidation,
} from './user.validation';
import { Prisma } from '../../generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { MalStatusWithPagination } from '../../types/mal';
import { MalService } from '../../common/mal.service';
import { SkipThrottle } from '@nestjs/throttler';
import cryptoRandomString from 'crypto-random-string';
import dayjs from 'dayjs';
import { MailService } from '../../common/mail.service';

@Injectable()
@SkipThrottle()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private dateFormatter: DateFormatterService,
    private config: ConfigService,
    private mal: MalService,
    private mail: MailService,
  ) {}

  getServerPageLink(link: string, endpoint: string) {
    const port = this.config.get<number>('PORT', 3000);
    const baseUrl = this.config.get<string>('BASE_URL', 'http://localhost');
    const queryLink = link.split('?')[1];
    return `${baseUrl}:${port}${endpoint}?${queryLink}`;
  }

  toUserData(user: UserResponse): UserResponse {
    return {
      id: user.id,
      username: user.username,
      picture: user.picture,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
    };
  }

  async getUserDetail(userId: number): Promise<UserFullResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
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
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      malId: user.malId ? parseInt(user.malId) : null,
      googleId: user.googleId ? parseInt(user.googleId) : null,
      ...this.dateFormatter.userResponse(user?.updatedAt, user?.createdAt),
    };
  }

  async updateUserDetail(
    userId: number,
    data: UpdateUserDetail,
  ): Promise<UserResponse> {
    try {
      let user = await this.prisma.user.update({
        where: { id: userId },
        data,
      });

      // If email change reverified user
      if (!user.googleId && !user.malId) {
        const otpCode = cryptoRandomString({ length: 6, type: 'numeric' });
        const otpExpiration = dayjs().add(10, 'minute').toISOString();
        user = await this.prisma.user.update({
          where: { id: userId },
          data: {
            isVerified: false,
            otpCode,
            otpExpiration,
          },
        });

        await this.mail.sendEmail(
          data.email,
          'IngetAnime - Email Verification',
          'otp-register',
          { otp: otpCode },
        );
      }

      return this.toUserData(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Username or email already exists');
        } else if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }
  }

  async getUserAnimeList(
    userId: number,
    data: GetUserAnimeList,
  ): Promise<UserAnimeListComputedResponse> {
    type SortKey = keyof typeof UserValidation.Sort;
    type OrderBy = Prisma.UserAnimeListOrderByWithRelationInput;
    const statusMap: Record<SortKey, OrderBy> = {
      list_score: { score: 'desc' },
      list_updated_at: { updatedAt: 'desc' },
      anime_release_at: {
        anime: { releaseAt: 'desc' },
      },
      anime_title: {
        anime: { title: 'asc' },
      },
      anime_id: {
        anime: { id: 'asc' },
      },
      // remaining_watchable_episodes: {},
    };

    const userAnimeList = await this.prisma.userAnimeList.findMany({
      where:
        data.status === 'all' ? { userId } : { userId, status: data.status },
      orderBy: statusMap[data.sort],
      include: {
        anime: {
          include: {
            animePlatforms: {
              orderBy: { isMainPlatform: 'desc' },
              include: { platform: true, link: true },
            },
          },
        },
      },
      take: data.limit + 1, // for next page check
      skip: data.offset,
    });

    const userAnimeListWithComputed: UserAnimeListComputed = [
      ...userAnimeList,
    ].map((list) => {
      // Sort anime platform based on user selected platform, isMainPlatform, or platform id
      list.anime.animePlatforms.sort((a, b) => {
        const animePlatformId = list.animePlatformId;
        if (
          animePlatformId &&
          (a.id === animePlatformId || b.id === animePlatformId)
        ) {
          return (
            Number(b.id === animePlatformId) - Number(a.id === animePlatformId)
          );
        } else if (a.isMainPlatform !== b.isMainPlatform) {
          return Number(b.isMainPlatform) - Number(a.isMainPlatform);
        } else {
          return a.platformId - b.platformId;
        }
      });

      const episodeAired = list.anime.animePlatforms[0]
        ? list.anime.animePlatforms[0].episodeAired
        : list.anime.status === 'finished_airing'
          ? list.anime.episodeTotal
          : 0;
      const remainingWatchableEpisodes = episodeAired
        ? episodeAired - list.episodesDifference - list.progress
        : 0;

      return {
        ...list,
        remainingWatchableEpisodes,
        ...this.dateFormatter.userAnimeListResponse(
          list.startDate,
          list.finishDate,
          list.updatedAt,
        ),
        anime: {
          ...list.anime,
          ...this.dateFormatter.animeResponse(
            list.anime.releaseAt,
            list.anime.updateAt,
          ),
          animePlatforms: [...list.anime.animePlatforms].map(
            (animePlatform) => ({
              ...animePlatform,
              ...this.dateFormatter.animePlatformResponse(
                animePlatform.lastEpisodeAiredAt,
                animePlatform.nextEpisodeAiringAt,
              ),
            }),
          ),
        },
      };
    });

    // if (data.sort === 'remaining_watchable_episodes') {
    //   userAnimeListWithComputed.sort(
    //     (a, b) => b.remainingWatchableEpisodes - a.remainingWatchableEpisodes,
    //   );
    // }

    const hasPrevPage = data.offset !== 0;
    const prevListLink = hasPrevPage
      ? this.getServerPageLink(
          `/me/my-list-status?${new URLSearchParams({
            ...data,
            limit: data.limit.toString(),
            offset: (data.offset - data.limit).toString(),
          })}`,
          '/me/my-list-status',
        )
      : undefined;
    const hasNextPage = userAnimeListWithComputed.length > data.limit;
    const nextListLink = hasNextPage
      ? this.getServerPageLink(
          `/me/my-list-status?${new URLSearchParams({
            ...data,
            limit: data.limit.toString(),
            offset: (data.offset + data.limit).toString(),
          })}`,
          '/me/my-list-status',
        )
      : undefined;

    return {
      userAnimeList: hasNextPage
        ? userAnimeListWithComputed.slice(0, -1)
        : userAnimeListWithComputed,
      ...((hasPrevPage || hasNextPage) && {
        paging: {
          prev: prevListLink,
          next: nextListLink,
        },
      }),
    };
  }

  async importAnimeListFromMal(
    userId: number,
    data: ImportAnimeListFromMal,
  ): Promise<{ count: number }> {
    const isLeft = true,
      limit = 100,
      userAnimeList: MalStatusWithPagination['my_list_status'] = [];
    let offset = 0;
    while (isLeft) {
      const userAnimeListFromMal = await this.mal.getAllMalStatus(
        userId,
        limit,
        offset,
      );
      userAnimeList.push(...userAnimeListFromMal.my_list_status);
      if (!userAnimeListFromMal.paging?.next) {
        break;
      }
      offset += limit;
    }

    const count = await this.mal.importAllMalStatusToDatabase(
      userAnimeList,
      userId,
      data,
    );

    return count;
  }

  async checkEmailAvailability(
    email: string,
    userId?: number,
  ): Promise<{ email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (user && user.id !== userId) {
      throw new ConflictException('Email already in use');
    }
    return { email };
  }

  async checkUsernameAvailability(
    username: string,
    userId?: number,
  ): Promise<{ username: string }> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (user && user.id !== userId) {
      throw new ConflictException('Username already in use');
    }
    return { username };
  }
}
