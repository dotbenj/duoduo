import {
  connectMongoClient,
  getMongoDbName,
  getMongoUri
} from './mongo.providers';

describe('mongo.providers', () => {
  describe('getMongoUri', () => {
    it('returns default when unset', () => {
      expect(getMongoUri({})).toBe('mongodb://localhost:27017');
    });

    it('returns env override', () => {
      expect(getMongoUri({ MONGO_URI: 'mongodb://example:27017' })).toBe(
        'mongodb://example:27017'
      );
    });
  });

  describe('getMongoDbName', () => {
    it('returns default when unset', () => {
      expect(getMongoDbName({})).toBe('duoduo');
    });

    it('returns env override', () => {
      expect(getMongoDbName({ MONGO_DB_NAME: 'mydb' })).toBe('mydb');
    });
  });

  describe('connectMongoClient', () => {
    it('connects via the provided factory', async () => {
      const client = { connect: jest.fn(async () => undefined) };
      const factory = jest.fn(() => client);

      const res = await connectMongoClient('mongodb://example:27017', factory as never);

      expect(factory).toHaveBeenCalledWith('mongodb://example:27017');
      expect(client.connect).toHaveBeenCalledTimes(1);
      expect(res).toBe(client);
    });

    it('propagates connection errors', async () => {
      const error = new Error('boom');
      const client = { connect: jest.fn(async () => Promise.reject(error)) };
      const factory = jest.fn(() => client);

      await expect(
        connectMongoClient('mongodb://example:27017', factory as never)
      ).rejects.toThrow('boom');
    });
  });

  it('mongoProviders factories wire up MongoClient and Db', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, MONGO_URI: 'mongodb://mock', MONGO_DB_NAME: 'mockdb' };

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        jest.doMock('mongodb', () => ({
          MongoClient: jest.fn().mockImplementation(() => ({
            connect: jest.fn(async () => undefined),
            db: jest.fn(() => ({ ok: true }))
          }))
        }));

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const providersModule = require('./mongo.providers') as typeof import('./mongo.providers');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const constantsModule = require('./mongo.constants') as typeof import('./mongo.constants');

        const clientProvider = providersModule.mongoProviders.find(
          (p) => 'provide' in p && p.provide === constantsModule.MONGO_CLIENT
        ) as { useFactory: () => Promise<unknown> } | undefined;
        const dbProvider = providersModule.mongoProviders.find(
          (p) => 'provide' in p && p.provide === constantsModule.MONGO_DB
        ) as { useFactory: (client: unknown) => unknown } | undefined;

        if (!clientProvider || !dbProvider) {
          reject(new Error('providers missing'));
          return;
        }

        clientProvider
          .useFactory()
          .then((client) => {
            const db = dbProvider.useFactory(client);
            expect(db).toEqual({ ok: true });
            resolve();
          })
          .catch(reject);
      });
    });

    process.env = originalEnv;
  });
});
