import { http } from "../api/http";
import type {
  MaintenanceRecord,
  CreateMaintenanceRecordRequest,
  FinishMaintenanceRecordRequest,
} from "../types/maintenance-records";

export const MaintenanceRecordsService = {
  async list(machineId: string): Promise<MaintenanceRecord[]> {
    const { data } = await http.get<MaintenanceRecord[]>(
      `/machines/${machineId}/maintenance-records`,
    );
    return data;
  },

  async findById(
    machineId: string,
    recordId: string,
  ): Promise<MaintenanceRecord> {
    const { data } = await http.get<MaintenanceRecord>(
      `/machines/${machineId}/maintenance-records/${recordId}`,
    );
    return data;
  },

  async create(
    machineId: string,
    payload: CreateMaintenanceRecordRequest,
  ): Promise<MaintenanceRecord> {
    const { data } = await http.post<MaintenanceRecord>(
      `/machines/${machineId}/maintenance-records`,
      payload,
    );
    return data;
  },

  async finish(
    machineId: string,
    recordId: string,
    payload: FinishMaintenanceRecordRequest,
  ): Promise<MaintenanceRecord> {
    const { data } = await http.patch<MaintenanceRecord>(
      `/machines/${machineId}/maintenance-records/${recordId}/finish`,
      payload,
    );
    return data;
  },
};
