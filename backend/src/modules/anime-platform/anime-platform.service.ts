import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  AnimePlatformId,
  CreateAnimePlatform,
  CreateOrUpdateAnimePlatform,
  UpdateAnimePlatform,
} from './anime-platform.validation';
import {
  AnimePlatformWithRelation,
  AnimePlatform,
  Link,
} from './anime-platform.model';
import {
  Anime as AnimePrisma,
  AnimePlatform as AnimePlatformPrisma,
  Link as LinkPrisma,
  Platform as PlatformPrisma,
  Prisma,
} from '../../generated/prisma/client';
import { DateFormatterService } from '../../common/date-formatter.service';
import { Platform } from '../platform/platform.model';
import { Anime } from '../anime/anime.model';

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

  async createAnimePlatform(
    param: AnimePlatformId,
    data: CreateAnimePlatform,
  ): Promise<AnimePlatformWithRelation> {
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
        include: {
          anime: true,
          platform: true,
          link: true,
        },
      });

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
  ): Promise<AnimePlatformWithRelation> {
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
  ): Promise<AnimePlatformWithRelation> {
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
        include: {
          anime: true,
          platform: true,
          link: true,
        },
      });

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
  ): Promise<AnimePlatformWithRelation & { statusCode: HttpStatus }> {
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

      let animePlatform: AnimePlatformPrisma & {
          anime: AnimePrisma;
          platform: PlatformPrisma;
          link: LinkPrisma;
        },
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
          include: {
            anime: true,
            platform: true,
            link: true,
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
              ...this.dateFormatter.animePlatformRequest(
                data.lastEpisodeAiredAt,
                data.nextEpisodeAiringAt,
              ),
              linkId,
              accessType,
            },
            include: {
              anime: true,
              platform: true,
              link: true,
            },
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
        anime: {
          ...animePlatform.anime,
          ...this.dateFormatter.animeResponse(
            animePlatform.anime.releaseAt,
            animePlatform.anime.updateAt,
          ),
        },
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

  async deleteAnimePlatform(param: AnimePlatformId): Promise<{
    id: AnimePlatform['id'];
    anime: {
      title: Anime['title'];
    };
    platform: {
      name: Platform['name'];
    };
    link: {
      url: Link['url'];
    };
  }> {
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
          link: {
            select: { url: true },
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
