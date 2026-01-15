import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { type MongoClient } from 'mongodb';

import { MONGO_CLIENT } from './mongo.constants';

@Injectable()
export class MongoLifecycleService implements OnApplicationShutdown {
  constructor(@Inject(MONGO_CLIENT) private readonly mongoClient: MongoClient) {}

  async onApplicationShutdown() {
    await this.mongoClient.close();
  }
}

