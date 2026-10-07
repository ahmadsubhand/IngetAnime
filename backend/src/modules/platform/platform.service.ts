import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Platform } from './platform.model';
import type { PlatformName } from './platform.validation';
import { Prisma } from '../../generated/prisma/client';
import sizeOf from 'image-size';
import { deleteLocalFile, saveLocalFile } from '../../utils/local-file-storage';

@Injectable()
export class PlatformService {
  private ICON_FOLDER_PATH = 'platforms';

  constructor(private prisma: PrismaService) {}

  async getAllPlatform(): Promise<
    (Platform & { _count: { animePlatforms: number } })[]
  > {
    const platforms = await this.prisma.platform.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { animePlatforms: true },
        },
      },
    });
    return platforms;
  }

  async createPlatform(
    data: PlatformName,
    file?: Express.Multer.File,
  ): Promise<Platform> {
    try {
      if (!file) {
        throw new BadRequestException('Platform icon is required');
      }
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }

      const dimensions = sizeOf(file.buffer);
      const width = dimensions.width;
      const height = dimensions.height;
      if (!width || !height) {
        throw new BadRequestException('Failed to calculate image dimensions');
      }
      const ratio = width / height;
      const iconUrl = saveLocalFile(this.ICON_FOLDER_PATH, data.name, file);

      const platform = await this.prisma.platform.create({
        data: {
          name: data.name,
          icon: iconUrl,
          width,
          height,
          ratio,
        },
      });
      return platform;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Platform already exists');
      }

      throw error;
    }
  }

  async getPlatformDetail(platformId: number): Promise<Platform> {
    const platform = await this.prisma.platform.findUnique({
      where: {
        id: platformId,
      },
    });
    if (!platform) {
      throw new NotFoundException('Platform not found');
    }
    return platform;
  }

  async updatePlatform(
    platformId: number,
    data: PlatformName,
    file?: Express.Multer.File,
  ): Promise<Platform> {
    try {
      if (file) {
        const existingPlatform = await this.prisma.platform.findUnique({
          where: {
            id: platformId,
          },
          select: {
            id: true,
            icon: true,
          },
        });
        if (!existingPlatform) {
          throw new NotFoundException('Platform not found');
        }

        if (!file.mimetype.startsWith('image/')) {
          throw new BadRequestException('Only image files are allowed');
        }
        const dimensions = sizeOf(file.buffer);
        const width = dimensions.width;
        const height = dimensions.height;
        if (!width || !height) {
          throw new BadRequestException('Failed to calculate image dimensions');
        }
        const ratio = width / height;

        deleteLocalFile(existingPlatform.icon);

        const newIconUrl = saveLocalFile(
          this.ICON_FOLDER_PATH,
          data.name,
          file,
        );

        const platform = await this.prisma.platform.update({
          where: {
            id: platformId,
          },
          data: {
            name: data.name,
            icon: newIconUrl,
            width,
            height,
            ratio,
          },
        });

        return platform;
      } else {
        const platform = await this.prisma.platform.update({
          where: {
            id: platformId,
          },
          data: data,
        });
        return platform;
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2002') {
          throw new ConflictException('Platform already exists');
        } else if (error.code === 'P2025') {
          throw new NotFoundException('Platform not found');
        }

      throw error;
    }
  }

  async deletePlatform(
    platformId: number,
  ): Promise<{ id: number; name: string }> {
    try {
      const platform = await this.prisma.platform.delete({
        where: {
          id: platformId,
        },
      });
      deleteLocalFile(platform.icon);
      return platform;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Platform not found');
      }

      throw error;
    }
  }
}
