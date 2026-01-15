import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { ParseObjectIdPipe } from './parse-objectid.pipe';

describe('ParseObjectIdPipe', () => {
  it('parses valid ObjectId strings', () => {
    const id = new ObjectId();
    const pipe = new ParseObjectIdPipe();

    const parsed = pipe.transform(id.toHexString());

    expect(parsed).toEqual(id);
  });

  it('throws on invalid ObjectId strings', () => {
    const pipe = new ParseObjectIdPipe();
    expect(() => pipe.transform('not-an-objectid')).toThrow(BadRequestException);
  });
});

