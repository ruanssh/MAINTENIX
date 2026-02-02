import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary.dto';

@ApiTags('dashboard')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  getSummary(@Query() query: DashboardSummaryQueryDto) {
    return this.dashboard.getSummary(query.shift);
  }
}
