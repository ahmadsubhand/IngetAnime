import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { CommonModule } from './common/common.module';

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
    CommonModule,
  ],
})
export class AppModule {}
