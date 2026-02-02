import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MaintenanceRecordShift } from '../machines/dto/create-maintenance-record.dto';

type ShiftCounts = Record<MaintenanceRecordShift, number>;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(shift?: MaintenanceRecordShift) {
    const shiftFilter = shift ? { shift } : {};

    const [pendingTotal, doneTotal] = await Promise.all([
      this.prisma.maintenance_records.count({
        where: { status: 'PENDING', ...shiftFilter },
      }),
      this.prisma.maintenance_records.count({
        where: { status: 'DONE', ...shiftFilter },
      }),
    ]);

    const pendingByShift = await this.prisma.maintenance_records.groupBy({
      by: ['shift'],
      where: { status: 'PENDING' },
      _count: { _all: true },
    });

    const doneByShift = await this.prisma.maintenance_records.groupBy({
      by: ['shift'],
      where: { status: 'DONE' },
      _count: { _all: true },
    });

    const shiftTotals: ShiftCounts = {
      PRIMEIRO: 0,
      SEGUNDO: 0,
      TERCEIRO: 0,
    };

    const shiftTotalsDone: ShiftCounts = {
      PRIMEIRO: 0,
      SEGUNDO: 0,
      TERCEIRO: 0,
    };

    pendingByShift.forEach((row) => {
      shiftTotals[row.shift] = row._count._all ?? 0;
    });

    doneByShift.forEach((row) => {
      shiftTotalsDone[row.shift] = row._count._all ?? 0;
    });

    const topMachines = await this.prisma.maintenance_records.groupBy({
      by: ['machine_id'],
      where: { status: 'PENDING', ...shiftFilter },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const machineIds = topMachines.map((row) => row.machine_id);
    const machines = machineIds.length
      ? await this.prisma.machines.findMany({
          where: { id: { in: machineIds } },
          select: { id: true, name: true },
        })
      : [];

    const machinesById = new Map(
      machines.map((machine) => [machine.id.toString(), machine.name]),
    );

    const topMachinesPending = topMachines.map((row) => ({
      machine_id: row.machine_id.toString(),
      name: machinesById.get(row.machine_id.toString()) ?? 'Sem nome',
      pending: row._count.id ?? 0,
    }));

    return {
      filters: { shift: shift ?? 'all' },
      totals: {
        pending: pendingTotal,
        done: doneTotal,
      },
      pendingByShift: shiftTotals,
      doneByShift: shiftTotalsDone,
      topMachinesPending,
    };
  }
}
