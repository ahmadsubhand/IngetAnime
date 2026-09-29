import { Module } from '@nestjs/common';
import { MyAnimeListController } from './my-anime-list.controller';
import { MyAnimeListService } from './my-anime-list.service';

@Module({
  providers: [MyAnimeListService],
  controllers: [MyAnimeListController],
  exports: [MyAnimeListService],
})
export class MyAnimeListModule {}
