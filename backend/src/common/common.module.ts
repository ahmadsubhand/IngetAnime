import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CsrfService } from './csrf.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        level:
          config.get<'production' | 'development'>('NODE_ENV') === 'production'
            ? 'info'
            : 'debug',
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  providers: [
    PrismaService,
    CsrfService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService, CsrfService],
})
export class CommonModule {}
