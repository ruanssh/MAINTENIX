import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MaintenanceRecordShift } from '../../machines/dto/create-maintenance-record.dto';

export class DashboardSummaryQueryDto {
  @ApiPropertyOptional({ enum: MaintenanceRecordShift })
  @IsOptional()
  @IsEnum(MaintenanceRecordShift)
  shift?: MaintenanceRecordShift;
}
