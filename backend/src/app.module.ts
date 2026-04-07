import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AnimeModule } from './anime/anime.module';
import { PlatformModule } from './platform/platform.module';
import { AnimePlatformModule } from './anime-platform/anime-platform.module';
import { UserAnimeListModule } from './user-anime-list/user-anime-list.module';

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
