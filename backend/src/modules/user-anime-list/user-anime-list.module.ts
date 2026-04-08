import { Module } from '@nestjs/common';
import { UserAnimeListService } from './user-anime-list.service';
import { UserAnimeListController } from './user-anime-list.controller';

@Module({
  providers: [UserAnimeListService],
  controllers: [UserAnimeListController],
})
export class UserAnimeListModule {}
