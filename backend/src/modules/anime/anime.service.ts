import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AnimeWithRelation, Anime } from './anime.model';
import { CreateAnime, UpdateAnime } from './anime.validation';
import { Prisma } from '../../generated/prisma/client';
import {
  animeInclude,
  animeRequest,
  animeResponse,
  animeResponseWithRelation,
} from '../../utils/model-formatter';

@Injectable()
export class AnimeService {
  constructor(private prisma: PrismaService) {}

  async createAnime(data: CreateAnime): Promise<Anime> {
    try {
      const anime = await this.prisma.anime.create({
        data: {
          ...data,
          ...animeRequest(data.releaseAt),
        },
      });

      return animeResponse(anime);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Anime already exists');
      }

      throw error;
    }
  }

  async getAnimeDetail(
    id: number,
    userId?: number,
  ): Promise<AnimeWithRelation> {
    const anime = await this.prisma.anime.findUnique({
      where: {
        id,
      },
      include: animeInclude(userId),
    });

    if (!anime) {
      throw new NotFoundException('Anime not found');
    }

    return animeResponseWithRelation(anime);
  }

  async updateAnime(animeId: number, data: UpdateAnime): Promise<Anime> {
    try {
      const anime = await this.prisma.anime.update({
        where: {
          id: animeId,
        },
        data: {
          ...data,
          ...animeRequest(data.releaseAt),
        },
      });

      return animeResponse(anime);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Anime already exists');
        } else if (error.code === 'P2025') {
          throw new NotFoundException('Anime not found');
        }
      }

      throw error;
    }
  }

  async deleteAnime(
    animeId: number,
  ): Promise<{ id: Anime['id']; title: Anime['title'] }> {
    try {
      const anime = await this.prisma.anime.delete({
        where: {
          id: animeId,
        },
        select: {
          id: true,
          title: true,
        },
      });

      return anime;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Anime not found');
      }

      throw error;
    }
  }
}
