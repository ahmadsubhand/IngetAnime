import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PlatformResponse } from '../types';
import type { PlatformName } from './platform.validation';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class PlatformService {
  constructor(private prisma: PrismaService) {}

  async createPlatform(data: PlatformName): Promise<PlatformResponse> {
    try {
      const platform = await this.prisma.platform.create({
        data,
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

  async getPlatformDetail(platformId: number): Promise<PlatformResponse> {
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
  ): Promise<PlatformResponse> {
    try {
      const platform = await this.prisma.platform.update({
        where: {
          id: platformId,
        },
        data,
      });
      return platform;
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

  async deletePlatform(platformId: number): Promise<PlatformResponse> {
    try {
      const platform = await this.prisma.platform.delete({
        where: {
          id: platformId,
        },
      });
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
