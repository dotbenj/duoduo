import { Module } from '@nestjs/common';

import { MongoLifecycleService } from './mongo.lifecycle.service';
import { mongoProviders } from './mongo.providers';

@Module({
  providers: [...mongoProviders, MongoLifecycleService],
  exports: [...mongoProviders]
})
export class MongoModule {}

