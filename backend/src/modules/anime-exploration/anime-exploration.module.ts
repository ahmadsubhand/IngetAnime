import { Module } from '@nestjs/common';
import { AnimeExplorationService } from './anime-exploration.service';
import { AnimeExplorationController } from './anime-exploration.controller';
import { MyAnimeListModule } from '../my-anime-list/my-anime-list.module';

@Module({
  imports: [MyAnimeListModule],
  providers: [AnimeExplorationService],
  controllers: [AnimeExplorationController],
})
export class AnimeExplorationModule {}
