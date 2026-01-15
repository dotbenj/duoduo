import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { type ObjectId } from 'mongodb';

import { ParseObjectIdPipe } from './parse-objectid.pipe';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
  UserDto
} from './user.dto';
import { UserService } from './user.service';

function parseLimit(limitRaw: string | undefined): number {
  if (limitRaw === undefined) return 100;
  const parsed = Number(limitRaw);
  return parsed;
}

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({ type: UserDto })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @ApiOkResponse({ type: UserDto, isArray: true })
  @ApiBadRequestResponse()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @Get()
  list(@Query() query: ListUsersQueryDto) {
    const raw =
      typeof query.limit === 'number'
        ? String(query.limit)
        : (query.limit as unknown as string | undefined);
    const limit = parseLimit(raw);
    return this.userService.listUsers(limit);
  }

  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiParam({ name: 'userId', type: String })
  @Get(':userId')
  get(@Param('userId', ParseObjectIdPipe) userId: ObjectId) {
    return this.userService.getUser(userId);
  }

  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  @ApiParam({ name: 'userId', type: String })
  @Put(':userId')
  update(
    @Param('userId', ParseObjectIdPipe) userId: ObjectId,
    @Body() body: UpdateUserDto
  ) {
    return this.userService.updateUser(userId, body);
  }

  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiParam({ name: 'userId', type: String })
  @HttpCode(204)
  @Delete(':userId')
  async remove(@Param('userId', ParseObjectIdPipe) userId: ObjectId) {
    await this.userService.deleteUser(userId);
  }
}
