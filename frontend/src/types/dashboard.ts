import type { Id } from "./api";
import type { MaintenanceRecordShift } from "./maintenance-records";

export type DashboardSummary = {
  filters: {
    shift: MaintenanceRecordShift | "all";
  };
  totals: {
    pending: number;
    done: number;
  };
  pendingByShift: Record<MaintenanceRecordShift, number>;
  doneByShift: Record<MaintenanceRecordShift, number>;
  topMachinesPending: Array<{
    machine_id: Id;
    name: string;
    pending: number;
  }>;
};
