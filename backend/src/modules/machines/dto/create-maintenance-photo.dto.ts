import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum MaintenancePhotoType {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export class CreateMaintenancePhotoDto {
  @ApiProperty({ enum: MaintenancePhotoType })
  @IsEnum(MaintenancePhotoType)
  type!: MaintenancePhotoType;
}
