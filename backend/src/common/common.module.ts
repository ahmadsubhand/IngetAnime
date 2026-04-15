import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CsrfService } from './csrf.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter.js';
import { MailService } from './mail.service';
import { CookieService } from './cookie.service';
import { MalService } from './mal.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './jwt.service';
import { GoogleService } from './google.service';
import { UtcService } from './utc.service';
import { DateFormatterService } from './date-formatter.service';
import { ModelSortService } from './model-sort.service';

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
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION', '28d') },
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: config.getOrThrow('MAILER_USER'),
            pass: config.getOrThrow('MAILER_PASSWORD'),
          },
        },
        defaults: {
          from: config.getOrThrow('MAILER_USER'),
        },
        template: {
          dir: join(__dirname, '..', '..', 'templates'),
          adapter: new EjsAdapter(),
        },
      }),
    }),
  ],
  providers: [
    PrismaService,
    CsrfService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    JwtService,
    MailService,
    CookieService,
    GoogleService,
    MalService,
    UtcService,
    DateFormatterService,
    ModelSortService,
  ],
  exports: [
    PrismaService,
    CsrfService,
    JwtService,
    MailService,
    CookieService,
    GoogleService,
    MalService,
    UtcService,
    DateFormatterService,
    ModelSortService,
  ],
})
export class CommonModule {}
