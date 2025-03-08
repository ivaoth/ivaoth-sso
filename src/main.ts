import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { resolve } from 'path';
import { format, transports } from 'winston';
import { AppModule } from './app.module';

const timestamp = new Date();

const myFormat = format.combine(
  format.timestamp(),
  format.printf((info) => `${info.timestamp as string} [${info.level}] ${info.message as string}`)
);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      format: myFormat,
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), myFormat)
        }),
        new transports.File({
          filename: resolve(
            __dirname,
            '..',
            'log',
            `log-${timestamp.getUTCFullYear().toString()}${(
              timestamp.getUTCMonth() + 1
            ).toString()}${timestamp.getUTCDate().toString()}-${timestamp
              .getUTCHours()
              .toString()
              .padStart(2, '0')}${timestamp.getUTCMinutes().toString().padStart(2, '0')}${timestamp
              .getUTCSeconds()
              .toString()
              .padStart(2, '0')}.log`
          )
        })
      ],
      exitOnError: false
    })
  });
  app.useStaticAssets(resolve(__dirname, '..', 'public'));
  app.setBaseViewsDir(resolve(__dirname, 'views'));
  app.setViewEngine('ejs');
  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
