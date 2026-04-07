import { Module } from '@nestjs/common';
import { UserAnimeListService } from './user-anime-list.service';
import { UserAnimeListController } from './user-anime-list.controller';
import { AnimeModule } from '../anime/anime.module';
import { AnimePlatformModule } from '../anime-platform/anime-platform.module';

@Module({
  imports: [AnimeModule, AnimePlatformModule],
  providers: [UserAnimeListService],
  controllers: [UserAnimeListController],
})
export class UserAnimeListModule {}
