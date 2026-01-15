import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  type OnModuleInit
} from '@nestjs/common';
import { ObjectId, type Db, type WithId } from 'mongodb';

import { MONGO_DB } from '../mongo/mongo.constants';
import { createPasswordHash } from './user.crypto';
import { type CreateUserDto, type UpdateUserDto, UserDto } from './user.dto';

type UserEntity = {
  email: string;
  password: string;
  salt: string;
};

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  );
}

@Injectable()
export class UserService implements OnModuleInit {
  constructor(@Inject(MONGO_DB) private readonly db: Db) {}

  private collection() {
    return this.db.collection<UserEntity>('users');
  }

  async onModuleInit() {
    await this.collection().createIndex({ email: 1 }, { unique: true });
  }

  async createUser(dto: CreateUserDto): Promise<UserDto> {
    const email = dto.email?.trim();
    const password = dto.password;
    if (!email) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');

    const encrypted = createPasswordHash(password);
    const doc = { email, password: encrypted.hash, salt: encrypted.salt };

    try {
      const res = await this.collection().insertOne(doc);
      return { _id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new ConflictException('email already exists');
      }
      throw error;
    }
  }

  async listUsers(limit: number): Promise<UserDto[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      throw new BadRequestException('limit must be an integer between 1 and 200');
    }

    const docs = (await this.collection()
      .find({}, { limit })
      .toArray()) as WithId<UserEntity>[];
    return docs.map((doc) => ({
      _id: doc._id.toHexString(),
      email: doc.email,
      password: doc.password,
      salt: doc.salt
    }));
  }

  async getUser(userId: ObjectId): Promise<UserDto> {
    const doc = (await this.collection().findOne({ _id: userId })) as WithId<UserEntity> | null;
    if (!doc) throw new NotFoundException('user not found');
    return {
      _id: doc._id.toHexString(),
      email: doc.email,
      password: doc.password,
      salt: doc.salt
    };
  }

  async updateUser(userId: ObjectId, dto: UpdateUserDto): Promise<UserDto> {
    const update: Partial<UserEntity> = {};

    if (dto.email !== undefined) {
      const email = dto.email.trim();
      if (!email) throw new BadRequestException('email cannot be empty');
      update.email = email;
    }

    if (dto.password !== undefined) {
      if (!dto.password) throw new BadRequestException('password cannot be empty');
      const encrypted = createPasswordHash(dto.password);
      update.password = encrypted.hash;
      update.salt = encrypted.salt;
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestException('at least one field must be provided');
    }

    try {
      const res = (await this.collection().findOneAndUpdate(
        { _id: userId },
        { $set: update },
        { returnDocument: 'after' }
      )) as WithId<UserEntity> | null;
      if (!res) throw new NotFoundException('user not found');
      return {
        _id: res._id.toHexString(),
        email: res.email,
        password: res.password,
        salt: res.salt
      };
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new ConflictException('email already exists');
      }
      throw error;
    }
  }

  async deleteUser(userId: ObjectId): Promise<void> {
    const res = (await this.collection().findOneAndDelete({
      _id: userId
    })) as WithId<UserEntity> | null;
    if (!res) throw new NotFoundException('user not found');
  }
}
