import { Module } from '@nestjs/common';
import { AnimePlatformService } from './anime-platform.service';
import { AnimePlatformController } from './anime-platform.controller';

@Module({
  providers: [AnimePlatformService],
  controllers: [AnimePlatformController],
})
export class AnimePlatformModule {}
