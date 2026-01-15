import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import * as userCrypto from './user.crypto';
import { UserService } from './user.service';

describe('UserService', () => {
  const createDb = (collection: unknown) =>
    ({
      collection: jest.fn(() => collection)
    }) as never;

  const createCollection = () => ({
    createIndex: jest.fn(async () => 'email_1'),
    insertOne: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn()
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('ensures unique index on init', async () => {
    const collection = createCollection();
    const service = new UserService(createDb(collection));

    await service.onModuleInit();

    expect(collection.createIndex).toHaveBeenCalledWith({ email: 1 }, { unique: true });
  });

  it('creates a user with encrypted password', async () => {
    jest.spyOn(userCrypto, 'createPasswordHash').mockReturnValue({
      salt: 'salt',
      hash: 'hash'
    });
    const collection = createCollection();
    const insertedId = new ObjectId();
    collection.insertOne.mockResolvedValue({ insertedId });

    const service = new UserService(createDb(collection));
    const res = await service.createUser({ email: ' a@b.com ', password: 'p' });

    expect(res).toEqual({
      _id: insertedId.toHexString(),
      email: 'a@b.com',
      password: 'hash',
      salt: 'salt'
    });
  });

  it('rejects missing email/password', async () => {
    const service = new UserService(createDb(createCollection()));
    await expect(
      service.createUser({ email: '', password: 'p' })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.createUser({ email: 'a@b.com', password: '' })
    ).rejects.toThrow(BadRequestException);
  });

  it('maps duplicate key to conflict', async () => {
    jest.spyOn(userCrypto, 'createPasswordHash').mockReturnValue({
      salt: 'salt',
      hash: 'hash'
    });
    const collection = createCollection();
    collection.insertOne.mockRejectedValue({ code: 11000 });
    const service = new UserService(createDb(collection));

    await expect(
      service.createUser({ email: 'a@b.com', password: 'p' })
    ).rejects.toThrow(ConflictException);
  });

  it('propagates unknown create errors', async () => {
    jest.spyOn(userCrypto, 'createPasswordHash').mockReturnValue({
      salt: 'salt',
      hash: 'hash'
    });
    const collection = createCollection();
    const error = new Error('boom');
    collection.insertOne.mockRejectedValue(error);
    const service = new UserService(createDb(collection));

    await expect(
      service.createUser({ email: 'a@b.com', password: 'p' })
    ).rejects.toThrow('boom');
  });

  it('lists users with limit validation', async () => {
    const collection = createCollection();
    const docs = [
      { _id: new ObjectId(), email: 'a@b.com', password: 'h', salt: 's' }
    ];
    collection.find.mockReturnValue({ toArray: jest.fn(async () => docs) });
    const service = new UserService(createDb(collection));

    await expect(service.listUsers(1)).resolves.toEqual([
      { _id: docs[0]!._id.toHexString(), email: 'a@b.com', password: 'h', salt: 's' }
    ]);
    await expect(service.listUsers(0)).rejects.toThrow(BadRequestException);
    await expect(service.listUsers(201)).rejects.toThrow(BadRequestException);
    await expect(service.listUsers(Number.NaN)).rejects.toThrow(BadRequestException);
  });

  it('gets a user or throws not found', async () => {
    const collection = createCollection();
    const id = new ObjectId();
    collection.findOne.mockResolvedValue({
      _id: id,
      email: 'a@b.com',
      password: 'h',
      salt: 's'
    });
    const service = new UserService(createDb(collection));

    await expect(service.getUser(id)).resolves.toEqual({
      _id: id.toHexString(),
      email: 'a@b.com',
      password: 'h',
      salt: 's'
    });

    collection.findOne.mockResolvedValue(null);
    await expect(service.getUser(id)).rejects.toThrow(NotFoundException);
  });

  it('updates a user or throws errors', async () => {
    jest.spyOn(userCrypto, 'createPasswordHash').mockReturnValue({
      salt: 'salt2',
      hash: 'hash2'
    });
    const collection = createCollection();
    const id = new ObjectId();
    collection.findOneAndUpdate.mockResolvedValue({
      _id: id,
      email: 'new@b.com',
      password: 'hash2',
      salt: 'salt2'
    });
    const service = new UserService(createDb(collection));

    await expect(
      service.updateUser(id, { email: ' new@b.com ', password: 'p2' })
    ).resolves.toEqual({
      _id: id.toHexString(),
      email: 'new@b.com',
      password: 'hash2',
      salt: 'salt2'
    });

    await expect(service.updateUser(id, {})).rejects.toThrow(BadRequestException);
    await expect(service.updateUser(id, { email: ' ' })).rejects.toThrow(BadRequestException);
    await expect(service.updateUser(id, { password: '' })).rejects.toThrow(
      BadRequestException
    );

    collection.findOneAndUpdate.mockResolvedValue(null);
    await expect(service.updateUser(id, { email: 'x@y.com' })).rejects.toThrow(
      NotFoundException
    );

    collection.findOneAndUpdate.mockRejectedValue({ code: 11000 });
    await expect(service.updateUser(id, { email: 'x@y.com' })).rejects.toThrow(
      ConflictException
    );
  });

  it('deletes a user or throws not found', async () => {
    const collection = createCollection();
    const id = new ObjectId();
    collection.findOneAndDelete.mockResolvedValue({
      _id: id,
      email: 'a@b.com',
      password: 'h',
      salt: 's'
    });
    const service = new UserService(createDb(collection));

    await expect(service.deleteUser(id)).resolves.toBeUndefined();

    collection.findOneAndDelete.mockResolvedValue(null);
    await expect(service.deleteUser(id)).rejects.toThrow(NotFoundException);
  });
});

