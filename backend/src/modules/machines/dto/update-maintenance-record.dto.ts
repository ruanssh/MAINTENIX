import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import {
  MaintenanceRecordCategory,
  MaintenanceRecordPriority,
  MaintenanceRecordShift,
} from './create-maintenance-record.dto';

export class UpdateMaintenanceRecordDto {
  @ApiProperty({ example: 'Vazamento na junta rotativa', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  problem_description?: string;

  @ApiProperty({ enum: MaintenanceRecordPriority, required: false })
  @IsOptional()
  @IsEnum(MaintenanceRecordPriority)
  priority?: MaintenanceRecordPriority;

  @ApiProperty({ enum: MaintenanceRecordCategory, required: false })
  @IsOptional()
  @IsEnum(MaintenanceRecordCategory)
  category?: MaintenanceRecordCategory;

  @ApiProperty({ enum: MaintenanceRecordShift, required: false })
  @IsOptional()
  @IsEnum(MaintenanceRecordShift)
  shift?: MaintenanceRecordShift;

  @ApiProperty({ example: '2026-01-27T10:30:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  started_at?: string;
}
