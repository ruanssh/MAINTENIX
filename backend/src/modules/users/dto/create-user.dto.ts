import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ADMINISTRADOR = 1,
  USUARIO = 2,
}

export class CreateUserDto {
  @ApiProperty({ example: 'Ruan' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'ruan@empresa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}
