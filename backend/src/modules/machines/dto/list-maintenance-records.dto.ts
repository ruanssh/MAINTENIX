import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  MaintenanceRecordCategory,
  MaintenanceRecordPriority,
  MaintenanceRecordShift,
} from './create-maintenance-record.dto';

export enum MaintenanceRecordStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export class ListMaintenanceRecordsQueryDto {
  @ApiPropertyOptional({ enum: MaintenanceRecordStatus })
  @IsOptional()
  @IsEnum(MaintenanceRecordStatus)
  status?: MaintenanceRecordStatus;

  @ApiPropertyOptional({ enum: MaintenanceRecordPriority })
  @IsOptional()
  @IsEnum(MaintenanceRecordPriority)
  priority?: MaintenanceRecordPriority;

  @ApiPropertyOptional({ enum: MaintenanceRecordCategory })
  @IsOptional()
  @IsEnum(MaintenanceRecordCategory)
  category?: MaintenanceRecordCategory;

  @ApiPropertyOptional({ enum: MaintenanceRecordShift })
  @IsOptional()
  @IsEnum(MaintenanceRecordShift)
  shift?: MaintenanceRecordShift;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  responsible_id?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  machine_id?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  query?: string;
}
