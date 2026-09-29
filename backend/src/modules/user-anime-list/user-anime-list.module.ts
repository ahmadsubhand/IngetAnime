import { Module } from '@nestjs/common';
import { UserAnimeListService } from './user-anime-list.service';
import { UserAnimeListController } from './user-anime-list.controller';
import { MyAnimeListModule } from '../my-anime-list/my-anime-list.module';

@Module({
  imports: [MyAnimeListModule],
  providers: [UserAnimeListService],
  controllers: [UserAnimeListController],
})
export class UserAnimeListModule {}
