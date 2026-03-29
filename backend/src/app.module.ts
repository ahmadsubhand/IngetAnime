import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AnimeModule } from './anime/anime.module';

@Module({
  imports: [CommonModule, AuthModule, AnimeModule],
  controllers: [AppController],
})
export class AppModule {}
