import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnimePlatformService } from './anime-platform.service';
import { AnimePlatformController } from './anime-platform.controller';

@Module({
  imports: [AuthModule],
  providers: [AnimePlatformService],
  controllers: [AnimePlatformController],
})
export class AnimePlatformModule {}
