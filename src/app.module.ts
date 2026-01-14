import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.DOTENV_CONFIG_PATH ?? 'dev.env',
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        MONGO_DB: Joi.string().default('duoduo'),
        MONGO_USERNAME: Joi.string().default('duoduo'),
        MONGO_PASSWORD: Joi.string().default('duoduo'),
        MONGODB_URI: Joi.string().optional()
      }),
      validationOptions: {
        allowUnknown: true
      }
    }),
    HealthModule
  ]
})
export class AppModule {}
