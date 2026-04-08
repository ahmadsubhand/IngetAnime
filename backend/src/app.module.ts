import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AnimeModule } from './modules/anime/anime.module';
import { PlatformModule } from './modules/platform/platform.module';
import { AnimePlatformModule } from './modules/anime-platform/anime-platform.module';
import { UserAnimeListModule } from './modules/user-anime-list/user-anime-list.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    AnimeModule,
    PlatformModule,
    AnimePlatformModule,
    UserAnimeListModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
