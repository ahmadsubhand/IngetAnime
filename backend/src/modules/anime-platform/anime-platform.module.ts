import { Module } from '@nestjs/common';
import { AnimePlatformService } from './anime-platform.service';
import { AnimePlatformController } from './anime-platform.controller';
import { AnimePlatformCron } from './anime-platform.cron';

@Module({
  providers: [AnimePlatformService, AnimePlatformCron],
  controllers: [AnimePlatformController],
})
export class AnimePlatformModule {}
