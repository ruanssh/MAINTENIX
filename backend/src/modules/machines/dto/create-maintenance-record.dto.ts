import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum MaintenanceRecordPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateMaintenanceRecordDto {
  @ApiProperty({ example: 'Vazamento na junta rotativa' })
  @IsString()
  @MinLength(1)
  problem_description!: string;

  @ApiProperty({ enum: MaintenanceRecordPriority, required: false })
  @IsOptional()
  @IsEnum(MaintenanceRecordPriority)
  priority?: MaintenanceRecordPriority;

  @ApiProperty({ example: '2026-01-27T10:30:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  started_at?: string;
}
