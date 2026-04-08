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
  AnimePlatformFullRelation,
  AnimePlatformResponse,
  AnimePlatformShortRelation,
} from '../types';
import { AnimePlatform, Prisma } from '../generated/prisma/client';
import { DateFormatterService } from '../common/date-formatter.service';

@Injectable()
export class AnimePlatformService {
  constructor(
    private prisma: PrismaService,
    private dateFormatter: DateFormatterService,
  ) {}

  async setUpMainPlatform(animeId: number) {
    await this.prisma.animePlatform.updateMany({
      where: { animeId },
      data: { isMainPlatform: false },
    });
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

  private selectedRelationQuery:
    | Prisma.AnimePlatformInclude
    | Prisma.AnimePlatformSelect = {
    anime: {
      select: { title: true },
    },
    platform: {
      select: { name: true },
    },
    link: {
      select: { url: true },
    },
  };

  async createAnimePlatform(
    param: AnimePlatformId,
    data: CreateAnimePlatform,
  ): Promise<AnimePlatformResponse & AnimePlatformShortRelation> {
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
          ...this.dateFormatter.animePlatformRequest(
            newData.lastEpisodeAiredAt,
            newData.nextEpisodeAiringAt,
          ),
          ...param,
          linkId,
        },
        include: this.selectedRelationQuery,
      });

      return {
        ...animePlatform,
        ...this.dateFormatter.animePlatformResponse(
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

  async getAnimePlatformDetail(
    param: AnimePlatformId,
  ): Promise<AnimePlatformResponse & AnimePlatformFullRelation> {
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
      ...this.dateFormatter.animePlatformResponse(
        animePlatform.lastEpisodeAiredAt,
        animePlatform.nextEpisodeAiringAt,
      ),
      anime: {
        ...animePlatform.anime,
        ...this.dateFormatter.animeResponse(
          animePlatform.anime.releaseAt,
          animePlatform.anime.updateAt,
        ),
      },
    };
  }

  async updateAnimePlatform(
    param: AnimePlatformId,
    data: UpdateAnimePlatform,
  ): Promise<AnimePlatformResponse & AnimePlatformShortRelation> {
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
          ...this.dateFormatter.animePlatformRequest(
            newData.lastEpisodeAiredAt,
            newData.nextEpisodeAiringAt,
          ),
          linkId,
        },
        include: this.selectedRelationQuery,
      });

      return {
        ...animePlatform,
        ...this.dateFormatter.animePlatformResponse(
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
    AnimePlatformResponse &
      AnimePlatformShortRelation & { statusCode: HttpStatus }
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

      let animePlatform: AnimePlatform & AnimePlatformShortRelation,
        statusCode = 200;

      try {
        animePlatform = await this.prisma.animePlatform.update({
          where: {
            platformId_animeId: { ...param },
          },
          data: {
            ...newData,
            ...this.dateFormatter.animePlatformRequest(
              data.lastEpisodeAiredAt,
              data.nextEpisodeAiringAt,
            ),
            linkId,
          },
          include: this.selectedRelationQuery,
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
              ...this.dateFormatter.animePlatformRequest(
                data.lastEpisodeAiredAt,
                data.nextEpisodeAiringAt,
              ),
              linkId,
              accessType,
            },
            include: this.selectedRelationQuery,
          });
        } else {
          throw error;
        }
      }

      return {
        ...animePlatform,
        ...this.dateFormatter.animePlatformResponse(
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

  async deleteAnimePlatform(
    param: AnimePlatformId,
  ): Promise<{ id: AnimePlatformResponse['id'] } & AnimePlatformShortRelation> {
    try {
      const animePlatform = await this.prisma.animePlatform.delete({
        where: {
          platformId_animeId: { ...param },
        },
        select: {
          id: true,
          ...this.selectedRelationQuery,
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
