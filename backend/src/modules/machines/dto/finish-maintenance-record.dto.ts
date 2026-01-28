import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class FinishMaintenanceRecordDto {
  @ApiProperty({ example: 'Troca da junta e reaperto do flange' })
  @IsString()
  @MinLength(1)
  solution_description!: string;

  @ApiProperty({ example: '2026-01-27T13:10:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  finished_at?: string;
}
