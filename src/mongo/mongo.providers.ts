import { type Provider } from '@nestjs/common';
import { MongoClient, type Db } from 'mongodb';

import { MONGO_CLIENT, MONGO_DB } from './mongo.constants';

export function getMongoUri(env: NodeJS.ProcessEnv = process.env): string {
  return env.MONGO_URI ?? 'mongodb://localhost:27017';
}

export function getMongoDbName(env: NodeJS.ProcessEnv = process.env): string {
  return env.MONGO_DB_NAME ?? 'duoduo';
}

export async function connectMongoClient(
  uri: string,
  createClient: (uri: string) => MongoClient
): Promise<MongoClient> {
  const client = createClient(uri);
  await client.connect();
  return client;
}

export const mongoProviders: Provider[] = [
  {
    provide: MONGO_CLIENT,
    useFactory: async () =>
      connectMongoClient(getMongoUri(), (uri) => new MongoClient(uri))
  },
  {
    provide: MONGO_DB,
    useFactory: (client: MongoClient): Db => client.db(getMongoDbName()),
    inject: [MONGO_CLIENT]
  }
];

