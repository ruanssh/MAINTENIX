import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({ example: 'Extrusora DS' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'Linha 3', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  line?: string;

  @ApiProperty({ example: 'Setor B', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  location?: string;

  @ApiProperty({ example: 'DS-3000', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  model?: string;

  @ApiProperty({ example: 'SN-001-2025', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  serial_number?: string;

  @ApiProperty({ example: 'https://cdn.exemplo.com/machines/1.jpg', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  photo_url?: string;
}
