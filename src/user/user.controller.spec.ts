import { ObjectId } from 'mongodb';

import { UserController } from './user.controller';
import { type UserDto } from './user.dto';
import { UserService } from './user.service';

describe('UserController', () => {
  const user: UserDto = {
    _id: '65a1c2d3e4f5678901234567',
    email: 'benjamin.roullet@gmail.com',
    password: 'hashed',
    salt: 'salt'
  };

  it('delegates create to UserService', async () => {
    const userService: Pick<UserService, 'createUser'> = {
      createUser: jest.fn(async () => user)
    };
    const controller = new UserController(userService as UserService);

    await expect(
      controller.create({ email: user.email, password: 'password' })
    ).resolves.toEqual(user);
    expect(userService.createUser).toHaveBeenCalledTimes(1);
  });

  it('delegates list to UserService with default limit', async () => {
    const userService: Pick<UserService, 'listUsers'> = {
      listUsers: jest.fn(async () => [user])
    };
    const controller = new UserController(userService as UserService);

    await expect(controller.list({})).resolves.toEqual([user]);
    expect(userService.listUsers).toHaveBeenCalledWith(100);
  });

  it('delegates list to UserService with explicit limit', async () => {
    const userService: Pick<UserService, 'listUsers'> = {
      listUsers: jest.fn(async () => [user])
    };
    const controller = new UserController(userService as UserService);

    await expect(controller.list({ limit: 2 })).resolves.toEqual([user]);
    await expect(controller.list({ limit: '4' as never })).resolves.toEqual([user]);
    expect(userService.listUsers).toHaveBeenNthCalledWith(1, 2);
    expect(userService.listUsers).toHaveBeenNthCalledWith(2, 4);
  });

  it('delegates get/update/delete to UserService', async () => {
    const userId = new ObjectId();
    const userService: Pick<
      UserService,
      'getUser' | 'updateUser' | 'deleteUser'
    > = {
      getUser: jest.fn(async () => user),
      updateUser: jest.fn(async () => user),
      deleteUser: jest.fn(async () => undefined)
    };
    const controller = new UserController(userService as UserService);

    await expect(controller.get(userId)).resolves.toEqual(user);
    await expect(controller.update(userId, { email: user.email })).resolves.toEqual(user);
    await expect(controller.remove(userId)).resolves.toBeUndefined();

    expect(userService.getUser).toHaveBeenCalledWith(userId);
    expect(userService.updateUser).toHaveBeenCalledWith(userId, { email: user.email });
    expect(userService.deleteUser).toHaveBeenCalledWith(userId);
  });
});

