import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';
import { MachinesMaintenanceService } from './machines-maintenance.service';
import { MachinesMaintenanceController } from './machines-maintenance.controller';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [MachinesService, MachinesMaintenanceService],
  controllers: [MachinesController, MachinesMaintenanceController],
})
export class MachinesModule {}
