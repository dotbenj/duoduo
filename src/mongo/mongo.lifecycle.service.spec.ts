import { MongoLifecycleService } from './mongo.lifecycle.service';

describe('MongoLifecycleService', () => {
  it('closes the MongoClient on shutdown', async () => {
    const mongoClient = { close: jest.fn(async () => undefined) };
    const service = new MongoLifecycleService(mongoClient as never);

    await service.onApplicationShutdown();

    expect(mongoClient.close).toHaveBeenCalledTimes(1);
  });
});

