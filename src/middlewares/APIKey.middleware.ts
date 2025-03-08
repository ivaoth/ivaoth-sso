import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

@Injectable()
export class APIKeyMiddleware implements NestMiddleware<Request, Response> {
  use(
    req: Request<
      ParamsDictionary,
      Record<string, unknown>,
      {
        apiKey: string;
      }
    >,
    res: Response,
    next: () => void
  ): void {
    if (
      (req.method.toUpperCase() === 'GET' && req.query['apiKey'] === process.env['API_KEY']) ||
      req.body['apiKey'] === process.env['API_KEY']
    ) {
      next();
    } else {
      res.status(401).send('No API Key').end();
    }
  }
}
