import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum MaintenanceRecordStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export class ListMaintenanceRecordsQueryDto {
  @ApiPropertyOptional({ enum: MaintenanceRecordStatus })
  @IsOptional()
  @IsEnum(MaintenanceRecordStatus)
  status?: MaintenanceRecordStatus;
}
