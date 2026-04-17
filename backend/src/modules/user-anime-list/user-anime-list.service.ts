import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateOrUpdateUserAnimeList,
  CreateUserAnimeList,
  UpdateUserAnimeList,
} from './user-anime-list.validation';
import {
  Prisma,
  UserAnimeList as UserAnimeListPrisma,
  Anime as AnimePrisma,
  AnimePlatform as AnimePlatformPrisma,
  Platform as PlatformPrisma,
  Link as LinkPrisma,
} from '../../generated/prisma/client';
import {
  UserAnimeListWithRelation,
  UserAnimeList,
} from './user-anime-list.model';
import { Anime } from '../anime/anime.model';
import { MalService } from '../../common/mal.service';
import { Link } from '../anime-platform/anime-platform.model';
import { Platform } from '../platform/platform.model';
import { ModelFormatterService } from '../../common/model-formatter.service';

@Injectable()
export class UserAnimeListService {
  constructor(
    private prisma: PrismaService,
    private mal: MalService,
    private modelFormatter: ModelFormatterService,
  ) {}

  async updateMalStatus(
    userId: number,
    animeId: number,
    data:
      | CreateUserAnimeList
      | UpdateUserAnimeList
      | CreateOrUpdateUserAnimeList,
  ) {
    const anime = await this.prisma.anime.findUnique({
      where: {
        id: animeId,
      },
      select: {
        malId: true,
      },
    });
    if (!anime) {
      throw new NotFoundException('Anime not found');
    } else {
      await this.mal.updateMalStatus(userId, anime.malId, {
        status: data.status,
        num_watched_episodes: data.progress,
        score: data.score,
        start_date: data.startDate,
        finish_date: data.finishDate,
      });
    }
  }

  private userAnimeListInclude = {
    anime: true,
    animePlatform: {
      include: {
        platform: true,
        link: true,
      },
    },
  };

  async checkAnimeSimilaritiesBetweenPlatformAndList(
    animeId: number,
    animePlatformId: number,
  ) {
    const animePlatform = await this.prisma.animePlatform.findUnique({
      where: { id: animePlatformId },
      select: { animeId: true },
    });
    if (!animePlatform) throw new NotFoundException('Platform not found');
    if (animePlatform.animeId !== animeId)
      throw new BadRequestException('Anime platform does not belong to anime');
  }

  async createUserAnimeList(
    animeId: number,
    userId: number,
    data: CreateUserAnimeList,
  ): Promise<UserAnimeListWithRelation> {
    try {
      if (data.animePlatformId) {
        await this.checkAnimeSimilaritiesBetweenPlatformAndList(
          animeId,
          data.animePlatformId,
        );
      }

      const userAnimeList = await this.prisma.userAnimeList.create({
        data: {
          ...data,
          ...this.modelFormatter.userAnimeListRequest(
            data.startDate,
            data.finishDate,
          ),
          userId,
          animeId,
        },
        include: this.userAnimeListInclude,
      });

      if (data.isSyncedWithMal) {
        await this.updateMalStatus(userId, animeId, data);
      }

      return this.modelFormatter.userAnimeListWithRelation(userAnimeList);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User anime list already exists');
        } else if (error.code === 'P2003') {
          throw new NotFoundException('Anime or platform not found');
        }
      }

      throw error;
    }
  }

  async getUserAnimeListDetail(
    animeId: number,
    userId: number,
  ): Promise<UserAnimeListWithRelation> {
    const userAnimeList = await this.prisma.userAnimeList.findUnique({
      where: {
        userId_animeId: { animeId, userId },
      },
      include: this.userAnimeListInclude,
    });
    if (!userAnimeList) {
      throw new NotFoundException('User anime list not found');
    }

    return this.modelFormatter.userAnimeListWithRelation(userAnimeList);
  }

  async updateUserAnimeList(
    animeId: number,
    userId: number,
    data: UpdateUserAnimeList,
  ): Promise<UserAnimeListWithRelation> {
    try {
      if (data.animePlatformId) {
        await this.checkAnimeSimilaritiesBetweenPlatformAndList(
          animeId,
          data.animePlatformId,
        );
      }

      const userAnimeList = await this.prisma.userAnimeList.update({
        where: {
          userId_animeId: { userId, animeId },
        },
        data: {
          ...data,
          ...this.modelFormatter.userAnimeListRequest(
            data.startDate,
            data.finishDate,
          ),
        },
        include: this.userAnimeListInclude,
      });

      if (data.isSyncedWithMal) {
        await this.updateMalStatus(userId, animeId, data);
      }

      return this.modelFormatter.userAnimeListWithRelation(userAnimeList);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User anime list already exists');
        } else if (error.code === 'P2003') {
          throw new NotFoundException('Platform not found');
        } else if (error.code === 'P2025') {
          throw new NotFoundException('User anime list not found');
        }
      }

      throw error;
    }
  }

  async createOrUpdateUserAnimeList(
    animeId: number,
    userId: number,
    data: CreateOrUpdateUserAnimeList,
  ): Promise<UserAnimeListWithRelation & { statusCode: HttpStatus }> {
    try {
      if (data.animePlatformId) {
        await this.checkAnimeSimilaritiesBetweenPlatformAndList(
          animeId,
          data.animePlatformId,
        );
      }

      let userAnimeList: UserAnimeListPrisma & {
          anime: AnimePrisma;
          animePlatform:
            | (AnimePlatformPrisma & {
                platform: PlatformPrisma;
                link: LinkPrisma;
              })
            | null;
        },
        statusCode = HttpStatus.OK;

      try {
        userAnimeList = await this.prisma.userAnimeList.update({
          where: {
            userId_animeId: { userId, animeId },
          },
          data: {
            ...data,
            ...this.modelFormatter.userAnimeListRequest(
              data.startDate,
              data.finishDate,
            ),
            userId,
            animeId,
          },
          include: this.userAnimeListInclude,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          statusCode = HttpStatus.CREATED;
          userAnimeList = await this.prisma.userAnimeList.create({
            data: {
              ...data,
              ...this.modelFormatter.userAnimeListRequest(
                data.startDate,
                data.finishDate,
              ),
              userId,
              animeId,
            },
            include: this.userAnimeListInclude,
          });
        } else {
          throw error;
        }
      }

      if (data.isSyncedWithMal) {
        await this.updateMalStatus(userId, animeId, data);
      }

      return {
        ...this.modelFormatter.userAnimeListWithRelation(userAnimeList),
        statusCode,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User anime list already exists');
        } else if (error.code === 'P2003') {
          throw new NotFoundException('Anime or platform not found');
        }
      }

      throw error;
    }
  }

  async deleteUserAnimeList(
    animeId: number,
    userId: number,
  ): Promise<
    {
      id: UserAnimeList['id'];
      isSyncedWithMal: UserAnimeList['isSyncedWithMal'];
    } & {
      anime: {
        title: Anime['title'];
        malId: Anime['malId'];
      };
    } & {
      animePlatform: {
        platform: {
          name: Platform['name'];
        };
        link: {
          url: Link['url'];
        };
      } | null;
    }
  > {
    try {
      const userAnimeList = await this.prisma.userAnimeList.delete({
        where: {
          userId_animeId: { userId, animeId },
        },
        select: {
          id: true,
          isSyncedWithMal: true,
          anime: {
            select: { title: true, malId: true },
          },
          animePlatform: {
            select: {
              platform: {
                select: { name: true },
              },
              link: {
                select: { url: true },
              },
            },
          },
        },
      });

      if (userAnimeList.isSyncedWithMal) {
        await this.mal.deleteMalStatus(userId, userAnimeList.anime.malId);
      }

      return userAnimeList;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User anime list not found');
      }

      throw error;
    }
  }
}
