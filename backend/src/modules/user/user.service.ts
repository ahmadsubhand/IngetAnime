import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  GetUserAnimeList,
  ImportAnimeListFromMal,
  UpdateUserDetail,
  UserValidation,
} from './user.validation';
import {
  Prisma,
  Anime as AnimePrisma,
  AnimePlatform as AnimePlatformPrisma,
  UserAnimeList as UserAnimeListPrisma,
  Platform as PlatformPrisma,
  Link as LinkPrisma,
} from '../../generated/prisma/client';
import { AllMalStatus } from '../my-anime-list/my-anime-list.model';
import { SkipThrottle } from '@nestjs/throttler';
import cryptoRandomString from 'crypto-random-string';
import dayjs from 'dayjs';
import { MailService } from '../../common/mail.service';
import { AllAnime, User } from './user.model';
import { ModelPaginationService } from '../../common/model-pagination.service';
import { MyAnimeListService } from '../my-anime-list/my-anime-list.service';
import {
  animeResponseWithRelation,
  userAnimeListInclude,
  userResponse,
  userSelect,
} from '../../utils/model-formatter';

@Injectable()
@SkipThrottle()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mal: MyAnimeListService,
    private mail: MailService,
    private modelPagination: ModelPaginationService,
  ) {}

  async getUserDetail(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return userResponse(user);
  }

  async updateUserDetail(
    userId: number,
    data: UpdateUserDetail,
  ): Promise<User> {
    try {
      const oldUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, malId: true, googleId: true },
      });
      if (!oldUser) {
        throw new NotFoundException('User not found');
      }

      if (!data.email && oldUser.email) {
        throw new BadRequestException('Cannot delete email address');
      }

      let user = await this.prisma.user.update({
        where: { id: userId },
        data,
        select: userSelect,
      });

      if (
        !user.googleId &&
        !user.malId &&
        data.email &&
        oldUser.email !== data.email
      ) {
        const otpCode = cryptoRandomString({ length: 6, type: 'numeric' });
        const otpExpiration = dayjs().add(10, 'minute').toISOString();
        user = await this.prisma.user.update({
          where: { id: userId },
          data: {
            isVerified: false,
            otpCode,
            otpExpiration,
          },
          select: userSelect,
        });

        await this.mail.sendEmail(
          data.email,
          'IngetAnime - Email Verification',
          'otp-register',
          { otp: otpCode },
        );
      }

      return userResponse(user);
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
  ): Promise<AllAnime> {
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
      where: {
        userId,
        ...(data.status !== 'all' && { status: data.status }),
        ...(data.platformId && {
          anime: {
            animePlatforms: {
              some: { platformId: data.platformId },
            },
          },
        }),
      },
      // data.status === 'all' ? { userId } : { userId, status: data.status },
      orderBy: statusMap[data.sort],
      include: userAnimeListInclude,
      take: data.limit + 1, // for next page check
      skip: data.offset,
    });

    const allAnimeFormat: (AnimePrisma & {
      animePlatforms: (AnimePlatformPrisma & {
        platform: PlatformPrisma;
        link: LinkPrisma;
      })[];
      userAnimeList: UserAnimeListPrisma[];
    })[] = [...userAnimeList].map((list) => {
      const { anime, ...userAnimeList } = list;
      const { animePlatforms, ...animeWithoutPlatforms } = anime;
      return {
        ...animeWithoutPlatforms,
        animePlatforms: animePlatforms,
        userAnimeList: [{ ...userAnimeList }],
      };
    });

    const { platformId, ...dataWithoutPlatformId } = data;
    const endpoint = '/user/me/my-list-status';
    const hasPrevPage = data.offset !== 0;
    const prevLink = hasPrevPage
      ? `${endpoint}?${new URLSearchParams({
          ...dataWithoutPlatformId,
          limit: data.limit.toString(),
          offset: (data.offset - data.limit).toString(),
          ...(platformId && { platformId: platformId.toString() }),
        })}`
      : undefined;
    const hasNextPage = allAnimeFormat.length > data.limit;
    const nextLink = hasNextPage
      ? `${endpoint}?${new URLSearchParams({
          ...dataWithoutPlatformId,
          limit: data.limit.toString(),
          offset: (data.offset + data.limit).toString(),
          ...(platformId && { platformId: platformId.toString() }),
        })}`
      : undefined;

    return {
      ...this.modelPagination.getServerPageLink(endpoint, prevLink, nextLink),
      anime: [...allAnimeFormat].map((anime) =>
        animeResponseWithRelation(anime),
      ),
    };

    // if (data.sort === 'remaining_watchable_episodes') {
    //   userAnimeListWithComputed.sort(
    //     (a, b) => b.remainingWatchableEpisodes - a.remainingWatchableEpisodes,
    //   );
    // }
  }

  async importAnimeListFromMal(
    userId: number,
    data: ImportAnimeListFromMal,
  ): Promise<{ count: number }> {
    const isLeft = true,
      limit = 100,
      userAnimeList: AllMalStatus['my_list_status'] = [];
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
