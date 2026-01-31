import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MachinesMaintenanceService } from './machines-maintenance.service';
import { ListMaintenanceRecordsQueryDto } from './dto/list-maintenance-records.dto';

@ApiTags('maintenance-records')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('maintenance-records')
export class MaintenanceRecordsController {
  constructor(private readonly maintenance: MachinesMaintenanceService) {}

  @Get()
  listAll(@Query() query: ListMaintenanceRecordsQueryDto) {
    return this.maintenance.listAllRecords(query);
  }
}
