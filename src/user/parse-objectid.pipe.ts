import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, ObjectId> {
  transform(value: string) {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid userId');
    }
    return new ObjectId(value);
  }
}

