import { BadRequestException, Injectable } from '@nestjs/common';
import { MalService } from '../../common/mal.service';
import { GetAnimeList } from './anime-exploration.validation';
import { AnimeListResponse } from '../../types/entity';
import { ConfigService } from '@nestjs/config';
import { MalError, MalListAnime } from '../../types/mal';
import { PrismaService } from '../../common/prisma.service';
import { UtcService } from '../../common/utc.service';
import { DateFormatterService } from '../../common/date-formatter.service';

@Injectable()
export class AnimeExplorationService {
  private CLIENT_ID: string;

  constructor(
    private config: ConfigService,
    private mal: MalService,
    private prisma: PrismaService,
    private utc: UtcService,
    private dateFormatter: DateFormatterService,
  ) {
    this.CLIENT_ID = this.config.getOrThrow('MAL_CLIENT_ID');
  }

  getServerPageLink(link: string) {
    const port = this.config.get<number>('PORT', 3000);
    const baseUrl = this.config.get<string>('BASE_URL', 'http://localhost');
    const queryLink = link.split('?')[1];
    return `${baseUrl}:${port}?${queryLink}`;
  }

  async insertAnimePlatform(
    animeFromMAL: MalListAnime['data'],
    userId?: number,
  ): Promise<AnimeListResponse['anime']> {
    // Preparing for insert new anime
    const allMalId = animeFromMAL.map((anime) => anime.node.id);
    const existingAnime = await this.prisma.anime.findMany({
      where: {
        malId: {
          in: allMalId,
        },
      },
    });
    const existingIds = new Set(existingAnime.map((anime) => anime.malId));
    const newAnime = animeFromMAL.filter(
      (anime) => !existingIds.has(anime.node.id),
    );

    // Add anime if not already in database
    if (newAnime.length > 0) {
      await this.prisma.anime.createMany({
        data: newAnime.map((anime) => {
          return {
            malId: anime.node.id,
            picture: anime.node.main_picture
              ? anime.node.main_picture.large
              : 'https://ik.imagekit.io/hq9ajk99t/_Pngtree_no%20image%20vector%20illustration%20isolated_4979075.png?updatedAt=1749865837127',
            title: anime.node.title,
            titleEN: anime.node.alternative_titles?.en,
            releaseAt: this.utc.dateToISOString(anime.node.start_date),
            episodeTotal: anime.node.num_episodes,
            status: anime.node.status,
          };
        }),
        skipDuplicates: true,
      });
    }

    // Get anime information from database
    const animeFromDatabase = await this.prisma.anime.findMany({
      where: {
        malId: { in: allMalId },
      },
      include: {
        animePlatforms: {
          include: {
            link: true,
            platform: true,
          },
        },
        userAnimeList: {
          where: {
            userId,
          },
        },
      },
    });

    // Sort anime platform based on user selected platform, isMainPlatform, or platform id
    for (const anime of animeFromDatabase) {
      anime.animePlatforms.sort((a, b) => {
        const animePlatformId = anime.userAnimeList[0].animePlatformId;
        if (
          animePlatformId &&
          (a.id === animePlatformId || b.id === animePlatformId)
        ) {
          return (
            Number(b.id === animePlatformId) - Number(a.id === animePlatformId)
          );
        } else if (a.isMainPlatform !== b.isMainPlatform) {
          return Number(b.isMainPlatform) - Number(a.isMainPlatform);
        } else {
          return a.platformId - b.platformId;
        }
      });
    }

    // Merge animeFromDatabase and animeFromMAL
    const animeMap = new Map(
      animeFromDatabase.map((anime) => [anime.malId, anime]),
    );
    const listAnimeMerge = animeFromMAL.map((anime) => {
      const malAnime = anime.node;
      const databaseAnime = animeMap.get(anime.node.id);
      if (!databaseAnime) {
        throw new Error(
          `Anime with malId ${anime.node.id} not found in database`,
        );
      }
      const userAnimeList = databaseAnime.userAnimeList[0];

      return {
        ...databaseAnime,
        ...this.dateFormatter.animeResponse(
          databaseAnime.releaseAt,
          databaseAnime.updateAt,
        ),
        userAnimeList: userAnimeList
          ? {
              ...userAnimeList,
              ...this.dateFormatter.userAnimeListResponse(
                userAnimeList.startDate,
                userAnimeList.finishDate,
                userAnimeList.updatedAt,
              ),
            }
          : null,
        animePlatforms: [...databaseAnime.animePlatforms].map((platform) => ({
          ...platform,
          ...this.dateFormatter.animePlatformResponse(
            platform.lastEpisodeAiredAt,
            platform.nextEpisodeAiringAt,
          ),
        })),
        ...malAnime,
        id: databaseAnime.id,
      };
    });

    return listAnimeMerge;
  }

  async getAnimeList(
    data: GetAnimeList,
    userId?: number,
  ): Promise<AnimeListResponse> {
    const accessToken = await this.mal.getMalConnection(userId);
    const url = `https://api.myanimelist.net/v2/anime`;
    const params = new URLSearchParams({
      q: data.q,
      ...(data.limit && { limit: data.limit.toString() }),
      ...(data.offset && { offset: data.offset.toString() }),
      ...(data.fields && { fields: data.fields }),
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : { 'X-MAL-CLIENT-ID': this.CLIENT_ID }),
      },
    });
    const animeFromMal = (await response.json()) as MalListAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    const animeList = await this.insertAnimePlatform(animeFromMal.data);
    const prevListLink = animeFromMal.paging?.prev
      ? this.getServerPageLink(animeFromMal.paging?.prev)
      : undefined;
    const nextListLink = animeFromMal.paging?.next
      ? this.getServerPageLink(animeFromMal.paging?.next)
      : undefined;

    return {
      anime: animeList,
      ...((prevListLink || nextListLink) && {
        paging: {
          prev: prevListLink,
          next: nextListLink,
        },
      }),
    };
  }
}
