import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot({
      format: winston.format.json(),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transports: [new winston.transports.Console()],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
