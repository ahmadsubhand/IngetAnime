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
import { Prisma } from '../../generated/prisma/client';
import { Platform } from '../platform/platform.model';
import { Anime } from '../anime/anime.model';
import {
  animePlatformRequest,
  animePlatformWithRelation,
} from '../../utils/model-formatter';
import dayjs from 'dayjs';

@Injectable()
export class AnimePlatformService {
  constructor(private prisma: PrismaService) {}

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

  private animePlatformInclude = {
    anime: true,
    platform: true,
    link: true,
  };

  checkEpisodeAirOrder(
    lastEpisodeAiredAt: Date | string | null,
    nextEpisodeAiringAt: Date | string | null,
  ) {
    if (
      lastEpisodeAiredAt &&
      nextEpisodeAiringAt &&
      !dayjs(lastEpisodeAiredAt).isBefore(dayjs(nextEpisodeAiringAt))
    )
      throw new BadRequestException(
        'lastEpisodeAiredAt must be before nextEpisodeAiringAt',
      );
  }

  async createAnimePlatform(
    param: AnimePlatformId,
    data: CreateAnimePlatform,
  ): Promise<AnimePlatformWithRelation> {
    try {
      const { link, ...dataWithoutLink } = data;
      const { id: linkId } = await this.createAnimePlatformLink(
        link,
        param.platformId,
      );

      if (dataWithoutLink.isMainPlatform) {
        await this.setUpMainPlatform(param.animeId);
      }
      this.checkEpisodeAirOrder(
        data.lastEpisodeAiredAt,
        data.nextEpisodeAiringAt,
      );

      const animePlatform = await this.prisma.animePlatform.create({
        data: {
          ...dataWithoutLink,
          ...animePlatformRequest(
            dataWithoutLink.lastEpisodeAiredAt,
            dataWithoutLink.nextEpisodeAiringAt,
          ),
          ...param,
          linkId,
        },
        include: this.animePlatformInclude,
      });

      return animePlatformWithRelation(animePlatform);
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
      include: this.animePlatformInclude,
    });
    if (!animePlatform) {
      throw new NotFoundException('Anime platform not found');
    }
    return animePlatformWithRelation(animePlatform);
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
      this.checkEpisodeAirOrder(
        data.lastEpisodeAiredAt,
        data.nextEpisodeAiringAt,
      );

      const animePlatform = await this.prisma.animePlatform.update({
        where: {
          platformId_animeId: { ...param },
        },
        data: {
          ...newData,
          ...animePlatformRequest(
            newData.lastEpisodeAiredAt,
            newData.nextEpisodeAiringAt,
          ),
          linkId,
        },
        include: this.animePlatformInclude,
      });

      return animePlatformWithRelation(animePlatform);
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

      let animePlatform = await this.prisma.animePlatform.findUnique({
        where: {
          platformId_animeId: { ...param },
        },
        include: this.animePlatformInclude,
      });
      let statusCode = HttpStatus.OK;

      if (animePlatform) {
        this.checkEpisodeAirOrder(
          data.lastEpisodeAiredAt || animePlatform.lastEpisodeAiredAt,
          data.nextEpisodeAiringAt || animePlatform.nextEpisodeAiringAt,
        );
        animePlatform = await this.prisma.animePlatform.update({
          where: { id: animePlatform.id },
          data: {
            ...newData,
            ...animePlatformRequest(
              data.lastEpisodeAiredAt,
              data.nextEpisodeAiringAt,
            ),
            linkId,
          },
          include: this.animePlatformInclude,
        });
      } else {
        statusCode = HttpStatus.CREATED;
        this.checkEpisodeAirOrder(
          data.lastEpisodeAiredAt || null,
          data.nextEpisodeAiringAt || null,
        );
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
            ...animePlatformRequest(
              data.lastEpisodeAiredAt,
              data.nextEpisodeAiringAt,
            ),
            linkId,
            accessType,
          },
          include: this.animePlatformInclude,
        });
      }

      return {
        ...animePlatformWithRelation(animePlatform),
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
