import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'senha-atual' })
  @IsString()
  @MinLength(6)
  current_password!: string;

  @ApiProperty({ example: 'nova-senha' })
  @IsString()
  @MinLength(6)
  new_password!: string;
}
