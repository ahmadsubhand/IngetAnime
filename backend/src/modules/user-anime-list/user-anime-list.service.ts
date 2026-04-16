import {
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
import { DateFormatterService } from '../../common/date-formatter.service';
import { MalService } from '../../common/mal.service';
import { ModelCountService } from '../../common/model-count.service';
import { Link } from '../anime-platform/anime-platform.model';
import { Platform } from '../platform/platform.model';

@Injectable()
export class UserAnimeListService {
  constructor(
    private prisma: PrismaService,
    private dateFormatter: DateFormatterService,
    private mal: MalService,
    private modelCount: ModelCountService,
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
  ): Promise<UserAnimeListWithRelation> {
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
          anime: true,
          animePlatform: {
            include: {
              platform: true,
              link: true,
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
        remainingWatchableEpisodes:
          this.modelCount.countRemainingWatchableEpisodes(
            userAnimeList,
            userAnimeList.anime,
            userAnimeList.animePlatform
              ? [{ ...userAnimeList.animePlatform }]
              : [],
          ),
        anime: {
          ...userAnimeList.anime,
          ...this.dateFormatter.animeResponse(
            userAnimeList.anime.releaseAt,
            userAnimeList.anime.updateAt,
          ),
        },
        ...(userAnimeList.animePlatform
          ? {
              animePlatform: {
                ...userAnimeList.animePlatform,
                ...this.dateFormatter.animePlatformResponse(
                  userAnimeList.animePlatform?.lastEpisodeAiredAt,
                  userAnimeList.animePlatform?.nextEpisodeAiringAt,
                ),
              },
            }
          : {
              animePlatform: null,
            }),
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
  ): Promise<UserAnimeListWithRelation> {
    const userAnimeList = await this.prisma.userAnimeList.findUnique({
      where: {
        userId_animeId: { animeId, userId },
      },
      include: {
        anime: true,
        animePlatform: {
          include: {
            platform: true,
            link: true,
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
      remainingWatchableEpisodes:
        this.modelCount.countRemainingWatchableEpisodes(
          userAnimeList,
          userAnimeList.anime,
          userAnimeList.animePlatform
            ? [
                ...Array<{ id: number; episodeAired: number }>(1).fill(
                  userAnimeList.animePlatform,
                ),
              ]
            : [],
        ),
      anime: {
        ...userAnimeList.anime,
        ...this.dateFormatter.animeResponse(
          userAnimeList.anime.releaseAt,
          userAnimeList.anime.updateAt,
        ),
      },
      ...(userAnimeList.animePlatform
        ? {
            animePlatform: {
              ...userAnimeList.animePlatform,
              ...this.dateFormatter.animePlatformResponse(
                userAnimeList.animePlatform?.lastEpisodeAiredAt,
                userAnimeList.animePlatform?.nextEpisodeAiringAt,
              ),
            },
          }
        : {
            animePlatform: null,
          }),
    };
  }

  async updateUserAnimeList(
    animeId: number,
    userId: number,
    data: UpdateUserAnimeList,
  ): Promise<UserAnimeListWithRelation> {
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
          anime: true,
          animePlatform: {
            include: {
              platform: true,
              link: true,
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
        remainingWatchableEpisodes:
          this.modelCount.countRemainingWatchableEpisodes(
            userAnimeList,
            userAnimeList.anime,
            userAnimeList.animePlatform
              ? [
                  ...Array<{ id: number; episodeAired: number }>(1).fill(
                    userAnimeList.animePlatform,
                  ),
                ]
              : [],
          ),
        anime: {
          ...userAnimeList.anime,
          ...this.dateFormatter.animeResponse(
            userAnimeList.anime.releaseAt,
            userAnimeList.anime.updateAt,
          ),
        },
        ...(userAnimeList.animePlatform
          ? {
              animePlatform: {
                ...userAnimeList.animePlatform,
                ...this.dateFormatter.animePlatformResponse(
                  userAnimeList.animePlatform?.lastEpisodeAiredAt,
                  userAnimeList.animePlatform?.nextEpisodeAiringAt,
                ),
              },
            }
          : {
              animePlatform: null,
            }),
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
  ): Promise<UserAnimeListWithRelation & { statusCode: HttpStatus }> {
    try {
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
            ...this.dateFormatter.userAnimeListRequest(
              data.startDate,
              data.finishDate,
            ),
            userId,
            animeId,
          },
          include: {
            anime: true,
            animePlatform: {
              include: {
                platform: true,
                link: true,
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
              anime: true,
              animePlatform: {
                include: {
                  platform: true,
                  link: true,
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
        remainingWatchableEpisodes:
          this.modelCount.countRemainingWatchableEpisodes(
            userAnimeList,
            userAnimeList.anime,
            userAnimeList.animePlatform
              ? [
                  ...Array<{ id: number; episodeAired: number }>(1).fill(
                    userAnimeList.animePlatform,
                  ),
                ]
              : [],
          ),
        anime: {
          ...userAnimeList.anime,
          ...this.dateFormatter.animeResponse(
            userAnimeList.anime.releaseAt,
            userAnimeList.anime.updateAt,
          ),
        },
        ...(userAnimeList.animePlatform
          ? {
              animePlatform: {
                ...userAnimeList.animePlatform,
                ...this.dateFormatter.animePlatformResponse(
                  userAnimeList.animePlatform?.lastEpisodeAiredAt,
                  userAnimeList.animePlatform?.nextEpisodeAiringAt,
                ),
              },
            }
          : {
              animePlatform: null,
            }),
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
            include: {
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
