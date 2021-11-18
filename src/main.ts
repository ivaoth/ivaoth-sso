import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { resolve } from 'path';
import { format, transports } from 'winston';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      format: format.timestamp(),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: resolve(__dirname, '..', 'log', 'log.txt')
        })
      ],
      exitOnError: false
    })
  });
  app.useStaticAssets(resolve(__dirname, '..', 'public'));
  app.setBaseViewsDir(resolve(__dirname, 'views'));
  app.setViewEngine('ejs');
  await app.listen(process.env.PORT);
}
void bootstrap();
