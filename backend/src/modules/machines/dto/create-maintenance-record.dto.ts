import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum MaintenanceRecordPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum MaintenanceRecordCategory {
  ELETRICA = 'ELETRICA',
  MECANICA = 'MECANICA',
  PNEUMATICA = 'PNEUMATICA',
  PROCESSO = 'PROCESSO',
  ELETRONICA = 'ELETRONICA',
  AUTOMACAO = 'AUTOMACAO',
  PREDIAL = 'PREDIAL',
  FERRAMENTARIA = 'FERRAMENTARIA',
  REFRIGERACAO = 'REFRIGERACAO',
  SETUP = 'SETUP',
  HIDRAULICA = 'HIDRAULICA',
}

export enum MaintenanceRecordShift {
  PRIMEIRO = 'PRIMEIRO',
  SEGUNDO = 'SEGUNDO',
  TERCEIRO = 'TERCEIRO',
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

  @ApiProperty({ enum: MaintenanceRecordCategory })
  @IsEnum(MaintenanceRecordCategory)
  category!: MaintenanceRecordCategory;

  @ApiProperty({ enum: MaintenanceRecordShift })
  @IsEnum(MaintenanceRecordShift)
  shift!: MaintenanceRecordShift;

  @ApiProperty({ example: '2026-01-27T10:30:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  started_at?: string;
}
