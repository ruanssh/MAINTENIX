import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MaintenanceEventType {
  REPLACEMENT = 'REPLACEMENT',
  INSPECTION = 'INSPECTION',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum MaintenanceEventDestination {
  REPAIR = 'REPAIR',
  SCRAP = 'SCRAP',
  ANALYSIS = 'ANALYSIS',
  STORAGE = 'STORAGE',
  RETURN = 'RETURN',
}

export class CreateMaintenanceEventDto {
  @ApiProperty({ example: 'Junta rotativa' })
  @IsString()
  @MinLength(1)
  component_name!: string;

  @ApiProperty({ enum: MaintenanceEventType })
  @IsEnum(MaintenanceEventType)
  event_type!: MaintenanceEventType;

  @ApiProperty({ example: '2026-01-27' })
  @IsDateString()
  event_date!: string;

  @ApiProperty({ example: "Junta rotativa 2'' inox", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  used_part_description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 'vazando', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  removed_condition?: string;

  @ApiProperty({ enum: MaintenanceEventDestination, required: false })
  @IsOptional()
  @IsEnum(MaintenanceEventDestination)
  destination?: MaintenanceEventDestination;

  @ApiProperty({ example: 'Reaperto após troca', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  observation?: string;

  @ApiProperty({ example: 'https://cdn.exemplo.com/events/1.jpg', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  photo_url?: string;
}
