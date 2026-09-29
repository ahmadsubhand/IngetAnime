import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard, OptionalAuthGuard } from './guard/auth.guard';
import { MyAnimeListModule } from '../my-anime-list/my-anime-list.module';

@Module({
  imports: [MyAnimeListModule],
  providers: [AuthService, AuthGuard, OptionalAuthGuard],
  exports: [AuthService, AuthGuard, OptionalAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
