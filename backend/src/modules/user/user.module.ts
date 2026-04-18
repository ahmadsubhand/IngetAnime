import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MyAnimeListModule } from '../my-anime-list/my-anime-list.module';

@Module({
  imports: [MyAnimeListModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
