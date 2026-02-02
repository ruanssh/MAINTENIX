import { http } from "../api/http";
import type { DashboardSummary } from "../types/dashboard";
import type { MaintenanceRecordShift } from "../types/maintenance-records";

export const DashboardService = {
  async getSummary(shift?: MaintenanceRecordShift): Promise<DashboardSummary> {
    const params = shift ? { shift } : undefined;
    const { data } = await http.get<DashboardSummary>("/dashboard/summary", {
      params,
    });
    return data;
  },
};
