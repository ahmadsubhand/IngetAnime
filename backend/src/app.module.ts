import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AnimeModule } from './modules/anime/anime.module';
import { PlatformModule } from './modules/platform/platform.module';
import { AnimePlatformModule } from './modules/anime-platform/anime-platform.module';
import { UserAnimeListModule } from './modules/user-anime-list/user-anime-list.module';
import { AnimeExplorationModule } from './modules/anime-exploration/anime-exploration.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    AnimeModule,
    PlatformModule,
    AnimePlatformModule,
    UserAnimeListModule,
    AnimeExplorationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
