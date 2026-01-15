import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '65a1c2d3e4f5678901234567' })
  _id!: string;

  @ApiProperty({ example: 'benjamin.roullet@gmail.com' })
  email!: string;

  @ApiProperty({
    description: 'Encrypted password (PBKDF2)',
    example: 'aabbccddeeff'
  })
  password!: string;

  @ApiProperty({ description: 'Password salt', example: '0011223344556677' })
  salt!: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'benjamin.roullet@gmail.com' })
  email!: string;

  @ApiProperty({ example: 'password' })
  password!: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'benjamin.roullet@gmail.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'new-password' })
  password?: string;
}

export class ListUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Max number of users to return (1-200)',
    example: 50
  })
  limit?: number;
}

