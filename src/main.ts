import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { resolve } from 'path';
import { format, transports } from 'winston';
import { AppModule } from './app.module';

const timestamp = new Date();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      format: format.json(),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: resolve(
            __dirname,
            '..',
            'log',
            `log-${timestamp.getUTCFullYear()}${
              timestamp.getUTCMonth() + 1
            }${timestamp.getUTCDate()}-${timestamp.getUTCHours()}${timestamp.getUTCMinutes()}${timestamp.getUTCSeconds()}.txt`
          )
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
