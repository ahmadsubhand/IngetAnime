import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AnimePlatformCron {
  constructor(
    private prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Cron('0 * * * * *', { timeZone: 'Asia/Jakarta' })
  async episodeAirScheduler() {
    const animePlatforms = await this.prisma.animePlatform.findMany({
      where: {
        isHiatus: false,
        nextEpisodeAiringAt: { lte: dayjs().toISOString() },
      },
      orderBy: { nextEpisodeAiringAt: 'asc' },
      select: {
        id: true,
        nextEpisodeAiringAt: true,
        lastEpisodeAiredAt: true,
        intervalInDays: true,
        episodeAired: true,
        anime: {
          select: {
            id: true,
            episodeTotal: true,
            status: true,
            title: true,
          },
        },
        platform: {
          select: {
            name: true,
          },
        },
      },
    });

    if (animePlatforms.length > 0) {
      await Promise.all(
        animePlatforms.map(async (animePlatform) => {
          const lastEpisodeAiredAt = dayjs(
            animePlatform.nextEpisodeAiringAt,
          ).toISOString();
          let nextEpisodeAiringAt = dayjs(animePlatform.nextEpisodeAiringAt)
            .add(animePlatform.intervalInDays, 'day')
            .toISOString();
          let isHiatus = false;
          const newEpisodeNumber = animePlatform.episodeAired + 1;

          // Current episode is last episode
          if (animePlatform.anime.episodeTotal === newEpisodeNumber) {
            nextEpisodeAiringAt = lastEpisodeAiredAt;
            isHiatus = true;

            // Last anime airing
            if (animePlatform.anime.status === 'currently_airing') {
              await this.prisma.anime.update({
                where: { id: animePlatform.anime.id },
                data: { status: 'finished_airing' },
              });
            }
          }

          // Current episode is first episode and anime airing
          if (
            animePlatform.episodeAired === 0 &&
            animePlatform.anime.status === 'not_yet_aired'
          ) {
            await this.prisma.anime.update({
              where: { id: animePlatform.anime.id },
              data: { status: 'currently_airing' },
            });
          }

          // Update lastEpisodeAiredAt and nextEpisodeAiringAt
          await this.prisma.animePlatform.update({
            where: { id: animePlatform.id },
            data: {
              episodeAired: newEpisodeNumber,
              lastEpisodeAiredAt,
              nextEpisodeAiringAt,
              isHiatus,
            },
          });

          this.logger.info(
            `Platform ${animePlatform.platform.name} for anime ${animePlatform.anime.title} updated to episode ${newEpisodeNumber}`,
          );
        }),
      );
    }
  }
}
