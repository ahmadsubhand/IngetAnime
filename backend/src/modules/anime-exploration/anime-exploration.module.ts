import { Module } from '@nestjs/common';
import { AnimeExplorationService } from './anime-exploration.service';
import { AnimeExplorationController } from './anime-exploration.controller';

@Module({
  providers: [AnimeExplorationService],
  controllers: [AnimeExplorationController],
})
export class AnimeExplorationModule {}
