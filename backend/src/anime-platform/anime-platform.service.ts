import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  AnimePlatformId,
  CreateAnimePlatform,
  CreateOrUpdateAnimePlatform,
  UpdateAnimePlatform,
} from './anime-platform.validation';
import {
  AnimePlatformResponse,
  AnimeResponse,
  LinkResponse,
  PlatformResponse,
} from '../types';
import { AnimePlatform, Prisma } from '../generated/prisma/client';
import { UtcService } from '../common/utc.service';
import dayjs from 'dayjs';

@Injectable()
export class AnimePlatformService {
  constructor(
    private prisma: PrismaService,
    private utc: UtcService,
  ) {}

  async setUpMainPlatform(animeId: number) {
    await this.prisma.animePlatform.updateMany({
      where: { animeId },
      data: { isMainPlatform: false },
    });
  }

  // Request need undefined
  formattedEpisodeAirRequest(
    lastEpisodeAiredAt?: Date | string | null,
    nextEpisodeAiringAt?: Date | string | null,
  ): {
    lastEpisodeAiredAt?: string | null;
    nextEpisodeAiringAt?: string | null;
  } {
    let formattedLastAiredAt: string | null | undefined;
    let formattedNextAiringAt: string | null | undefined;

    if (lastEpisodeAiredAt) {
      formattedLastAiredAt = dayjs(lastEpisodeAiredAt).toISOString();
    } else {
      formattedLastAiredAt = lastEpisodeAiredAt;
    }

    if (nextEpisodeAiringAt) {
      formattedNextAiringAt = dayjs(nextEpisodeAiringAt).toISOString();
    } else {
      formattedNextAiringAt = nextEpisodeAiringAt;
    }

    return {
      lastEpisodeAiredAt: formattedLastAiredAt,
      nextEpisodeAiringAt: formattedNextAiringAt,
    };
  }

  // Request avoid undefined
  formattedEpisodeAirResponse(
    lastEpisodeAiredAt: Date | string | null,
    nextEpisodeAiringAt: Date | string | null,
  ): {
    lastEpisodeAiredAt: string | null;
    nextEpisodeAiringAt: string | null;
  } {
    let formattedLastAiredAt: string | null;
    let formattedNextAiringAt: string | null;

    if (lastEpisodeAiredAt) {
      formattedLastAiredAt = dayjs(lastEpisodeAiredAt).toISOString();
    } else {
      formattedLastAiredAt = lastEpisodeAiredAt;
    }

    if (nextEpisodeAiringAt) {
      formattedNextAiringAt = dayjs(nextEpisodeAiringAt).toISOString();
    } else {
      formattedNextAiringAt = nextEpisodeAiringAt;
    }

    return {
      lastEpisodeAiredAt: formattedLastAiredAt,
      nextEpisodeAiringAt: formattedNextAiringAt,
    };
  }

  async createAnimePlatformLink(link: string, platformId: number) {
    let linkDatabase = await this.prisma.link.findUnique({
      where: { url: link },
    });

    if (!linkDatabase) {
      try {
        linkDatabase = await this.prisma.link.create({
          data: {
            platformId,
            url: link,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2003'
        ) {
          throw new NotFoundException('Platform not found');
        }
        throw error;
      }
    }

    if (linkDatabase.platformId !== platformId) {
      throw new BadRequestException('Link does not match platform');
    }

    return linkDatabase;
  }

  async createAnimePlatform(
    param: AnimePlatformId,
    data: CreateAnimePlatform,
  ): Promise<
    Omit<AnimePlatformResponse, 'link'> & {
      platform: { name: PlatformResponse['name'] };
    } & {
      anime: { title: AnimeResponse['title'] };
    } & {
      link: { url: LinkResponse['url'] };
    }
  > {
    try {
      const { link, ...newData } = data;
      const { id: linkId } = await this.createAnimePlatformLink(
        link,
        param.platformId,
      );

      if (newData.isMainPlatform) {
        await this.setUpMainPlatform(param.animeId);
      }

      const animePlatform = await this.prisma.animePlatform.create({
        data: {
          ...newData,
          ...this.formattedEpisodeAirRequest(
            newData.lastEpisodeAiredAt,
            newData.nextEpisodeAiringAt,
          ),
          ...param,
          linkId,
        },
        include: {
          anime: {
            select: { title: true },
          },
          platform: {
            select: { name: true },
          },
          link: {
            select: { url: true },
          },
        },
      });

      return {
        ...animePlatform,
        ...this.formattedEpisodeAirResponse(
          animePlatform.lastEpisodeAiredAt,
          animePlatform.nextEpisodeAiringAt,
        ),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Anime not found');
        } else if (error.code === 'P2002') {
          console.log(error);
          throw new ConflictException('Anime platform already exists');
        }
      }

      throw error;
    }
  }

  async getAnimePlatformDetail(param: AnimePlatformId): Promise<
    AnimePlatformResponse & { platform: PlatformResponse } & {
      anime: AnimeResponse;
    }
  > {
    const animePlatform = await this.prisma.animePlatform.findUnique({
      where: {
        platformId_animeId: { ...param },
      },
      include: {
        platform: true,
        anime: true,
        link: true,
      },
    });
    if (!animePlatform) {
      throw new NotFoundException('Anime platform not found');
    }
    return {
      ...animePlatform,
      ...this.formattedEpisodeAirResponse(
        animePlatform.lastEpisodeAiredAt,
        animePlatform.nextEpisodeAiringAt,
      ),
      anime: {
        ...animePlatform.anime,
        updateAt: animePlatform.anime.updateAt
          ? dayjs(animePlatform.anime.updateAt).toISOString()
          : dayjs().toISOString(),
        releaseAt: this.utc.ISOStringToYYYMMDD(animePlatform.anime.releaseAt),
      },
    };
  }

  async updateAnimePlatform(
    param: AnimePlatformId,
    data: UpdateAnimePlatform,
  ): Promise<
    Omit<AnimePlatformResponse, 'link'> & {
      platform: { name: PlatformResponse['name'] };
    } & {
      anime: { title: AnimeResponse['title'] };
    } & {
      link: { url: LinkResponse['url'] };
    }
  > {
    try {
      const { link, ...newData } = data;
      const { id: linkId } = await this.createAnimePlatformLink(
        link,
        param.platformId,
      );

      if (newData.isMainPlatform) {
        await this.setUpMainPlatform(param.animeId);
      }

      const animePlatform = await this.prisma.animePlatform.update({
        where: {
          platformId_animeId: { ...param },
        },
        data: {
          ...newData,
          ...this.formattedEpisodeAirRequest(
            newData.lastEpisodeAiredAt,
            newData.nextEpisodeAiringAt,
          ),
          linkId,
        },
        include: {
          anime: {
            select: { title: true },
          },
          platform: {
            select: { name: true },
          },
          link: {
            select: { url: true },
          },
        },
      });

      return {
        ...animePlatform,
        ...this.formattedEpisodeAirResponse(
          animePlatform.lastEpisodeAiredAt,
          animePlatform.nextEpisodeAiringAt,
        ),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Platform already exists');
        } else if (error.code === 'P2025') {
          throw new NotFoundException('Anime platform not found');
        }
      }

      throw error;
    }
  }

  async createOrUpdateAnimePlatform(
    param: AnimePlatformId,
    data: CreateOrUpdateAnimePlatform,
  ): Promise<
    Omit<AnimePlatformResponse, 'link'> & {
      platform: { name: PlatformResponse['name'] };
    } & {
      anime: { title: AnimeResponse['title'] };
    } & {
      link: { url: LinkResponse['url'] };
    } & {
      statusCode: HttpStatus;
    }
  > {
    try {
      const { link, ...newData } = data;
      let linkId: number | undefined;
      if (link) {
        const { id } = await this.createAnimePlatformLink(
          link,
          param.platformId,
        );
        linkId = id;
      }

      if (newData.isMainPlatform) {
        await this.setUpMainPlatform(param.animeId);
      }

      let animePlatform: AnimePlatform & {
          platform: { name: PlatformResponse['name'] };
        } & {
          anime: { title: AnimeResponse['title'] };
        } & {
          link: { url: LinkResponse['url'] };
        },
        statusCode = 200;

      try {
        animePlatform = await this.prisma.animePlatform.update({
          where: {
            platformId_animeId: { ...param },
          },
          data: {
            ...newData,
            ...this.formattedEpisodeAirRequest(
              data.lastEpisodeAiredAt,
              data.nextEpisodeAiringAt,
            ),
            linkId,
          },
          include: {
            anime: {
              select: { title: true },
            },
            platform: {
              select: { name: true },
            },
            link: {
              select: { url: true },
            },
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          statusCode = 201;
          const { accessType } = newData;
          if (!linkId || !accessType) {
            throw new BadRequestException(
              'Creating a new anime platform requires link and access type',
            );
          }
          animePlatform = await this.prisma.animePlatform.create({
            data: {
              ...newData,
              ...param,
              ...this.formattedEpisodeAirRequest(
                data.lastEpisodeAiredAt,
                data.nextEpisodeAiringAt,
              ),
              linkId,
              accessType,
            },
            include: {
              anime: {
                select: { title: true },
              },
              platform: {
                select: { name: true },
              },
              link: {
                select: { url: true },
              },
            },
          });
        } else {
          throw error;
        }
      }

      return {
        ...animePlatform,
        ...this.formattedEpisodeAirResponse(
          animePlatform.lastEpisodeAiredAt,
          animePlatform.nextEpisodeAiringAt,
        ),
        statusCode,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Anime platform not found');
        } else if (error.code === 'P2002') {
          throw new ConflictException('Anime platform already exists');
        }
      }

      throw error;
    }
  }

  async deleteAnimePlatform(param: AnimePlatformId): Promise<
    {
      id: AnimePlatformResponse['id'];
    } & {
      platform: { name: PlatformResponse['name'] };
    } & {
      anime: { title: AnimeResponse['title'] };
    }
  > {
    try {
      const animePlatform = await this.prisma.animePlatform.delete({
        where: {
          platformId_animeId: { ...param },
        },
        select: {
          id: true,
          anime: {
            select: { title: true },
          },
          platform: {
            select: { name: true },
          },
        },
      });

      return animePlatform;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Anime platform not found');
      }

      throw error;
    }
  }
}
