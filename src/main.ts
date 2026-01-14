import 'reflect-metadata';

import { existsSync } from 'node:fs';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as dotenvConfig } from 'dotenv';

import { AppModule } from './app.module';

async function bootstrap() {
  const dotenvPath = process.env.DOTENV_CONFIG_PATH ?? 'dev.env';
  if (existsSync(dotenvPath)) {
    dotenvConfig({ path: dotenvPath });
  }

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Duoduo API')
    .setDescription('Duoduo HTTP API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
