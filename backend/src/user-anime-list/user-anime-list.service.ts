import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateOrUpdateUserAnimeList,
  CreateUserAnimeList,
  UpdateUserAnimeList,
} from './user-anime-list.validation';
import { Prisma, UserAnimeList } from '../generated/prisma/client';
import {
  AnimeResponse,
  UserAnimeListFullRelation,
  UserAnimeListResponse,
  UserAnimeListShortRelation,
} from '../types';
import { DateFormatterService } from '../common/date-formatter.service';
import { MalService } from '../common/mal.service';

@Injectable()
export class UserAnimeListService {
  constructor(
    private prisma: PrismaService,
    private dateFormatter: DateFormatterService,
    private mal: MalService,
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

  async createUserAnimeList(
    animeId: number,
    userId: number,
    data: CreateUserAnimeList,
  ): Promise<UserAnimeListResponse & UserAnimeListShortRelation> {
    try {
      const userAnimeList = await this.prisma.userAnimeList.create({
        data: {
          ...data,
          ...this.dateFormatter.userAnimeListRequest(
            data.startDate,
            data.finishDate,
          ),
          userId,
          animeId,
        },
        include: {
          anime: {
            select: { title: true },
          },
          platform: {
            select: {
              link: {
                select: {
                  url: true,
                },
              },
              platform: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (data.isSyncedWithMal) {
        await this.updateMalStatus(userId, animeId, data);
      }

      return {
        ...userAnimeList,
        ...this.dateFormatter.userAnimeListResponse(
          userAnimeList.startDate,
          userAnimeList.finishDate,
          userAnimeList.updatedAt,
        ),
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

  async getUserAnimeListDetail(
    animeId: number,
    userId: number,
  ): Promise<UserAnimeListResponse & UserAnimeListFullRelation> {
    const userAnimeList = await this.prisma.userAnimeList.findUnique({
      where: {
        userId_animeId: { animeId, userId },
      },
      include: {
        anime: true,
        platform: {
          include: {
            link: true,
            platform: true,
          },
        },
      },
    });
    if (!userAnimeList) {
      throw new NotFoundException('User anime list not found');
    }

    return {
      ...userAnimeList,
      ...this.dateFormatter.userAnimeListResponse(
        userAnimeList.startDate,
        userAnimeList.finishDate,
        userAnimeList.updatedAt,
      ),
      anime: {
        ...userAnimeList.anime,
        ...this.dateFormatter.animeResponse(
          userAnimeList.anime.releaseAt,
          userAnimeList.anime.updateAt,
        ),
      },
      platform: userAnimeList.platform
        ? {
            ...userAnimeList.platform,
            ...this.dateFormatter.animePlatformResponse(
              userAnimeList.platform.lastEpisodeAiredAt,
              userAnimeList.platform.nextEpisodeAiringAt,
            ),
          }
        : null,
    };
  }

  async updateUserAnimeList(
    animeId: number,
    userId: number,
    data: UpdateUserAnimeList,
  ): Promise<UserAnimeListResponse & UserAnimeListShortRelation> {
    try {
      const userAnimeList = await this.prisma.userAnimeList.update({
        where: {
          userId_animeId: { userId, animeId },
        },
        data: {
          ...data,
          ...this.dateFormatter.userAnimeListRequest(
            data.startDate,
            data.finishDate,
          ),
        },
        include: {
          anime: {
            select: { title: true },
          },
          platform: {
            select: {
              link: {
                select: {
                  url: true,
                },
              },
              platform: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (data.isSyncedWithMal) {
        await this.updateMalStatus(userId, animeId, data);
      }

      return {
        ...userAnimeList,
        ...this.dateFormatter.userAnimeListResponse(
          userAnimeList.startDate,
          userAnimeList.finishDate,
          userAnimeList.updatedAt,
        ),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User anime list already exists');
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
  ): Promise<
    UserAnimeListResponse &
      UserAnimeListShortRelation & { statusCode: HttpStatus }
  > {
    try {
      let userAnimeList: UserAnimeList & UserAnimeListShortRelation,
        statusCode = HttpStatus.OK;

      try {
        userAnimeList = await this.prisma.userAnimeList.update({
          where: {
            userId_animeId: { userId, animeId },
          },
          data: {
            ...data,
            ...this.dateFormatter.userAnimeListRequest(
              data.startDate,
              data.finishDate,
            ),
            userId,
            animeId,
          },
          include: {
            anime: {
              select: { title: true },
            },
            platform: {
              select: {
                link: {
                  select: {
                    url: true,
                  },
                },
                platform: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
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
              ...this.dateFormatter.userAnimeListRequest(
                data.startDate,
                data.finishDate,
              ),
              userId,
              animeId,
            },
            include: {
              anime: {
                select: { title: true },
              },
              platform: {
                select: {
                  link: {
                    select: {
                      url: true,
                    },
                  },
                  platform: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });
        } else {
          throw error;
        }
      }

      if (data.isSyncedWithMal) {
        await this.updateMalStatus(userId, animeId, data);
      }

      return {
        ...userAnimeList,
        ...this.dateFormatter.userAnimeListResponse(
          userAnimeList.startDate,
          userAnimeList.finishDate,
          userAnimeList.updatedAt,
        ),
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
      id: UserAnimeListResponse['id'];
      isSyncedWithMal: UserAnimeListResponse['isSyncedWithMal'];
    } & {
      anime: {
        title: AnimeResponse['title'];
        malId: AnimeResponse['malId'];
      };
    } & {
      platform: UserAnimeListShortRelation['platform'];
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
            select: {
              title: true,
              malId: true,
            },
          },
          platform: {
            select: {
              link: {
                select: {
                  url: true,
                },
              },
              platform: {
                select: {
                  name: true,
                },
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
