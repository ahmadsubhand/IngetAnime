import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import morgan from 'morgan';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import mustacheExpress from 'mustache-express';
import { join } from 'path';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CsrfService } from './common/csrf.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Config
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<'production' | 'development'>(
    'NODE_ENV',
    'development',
  );
  const clientUrl = configService.get<string>(
    'CLIENT_URL',
    'http://localhost:5173',
  );
  const baseUrl = configService.get<string>('BASE_URL', 'http://localhost');

  // Logger - Winston
  const loggerService = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(loggerService);

  // Logger - Morgan
  if (environment === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }

  // Template engine
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('html');
  app.engine('html', mustacheExpress());

  // Cookie
  app.use(cookieParser());

  // CORS protection
  const corsOption: CorsOptions = {
    origin: [clientUrl],
    credentials: true,
  };
  app.enableCors(corsOption);

  // CSRF protection
  const csrfService = app.get(CsrfService);
  app.use(csrfService.protect());

  // Listen server
  await app.listen(port, () => {
    loggerService.log(
      `Server running in ${environment} mode at ${baseUrl}:${port}`,
    );
  });
}
void bootstrap();
