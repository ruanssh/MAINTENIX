import { http } from "../api/http";
import type {
  MaintenanceRecord,
  CreateMaintenanceRecordRequest,
  FinishMaintenanceRecordRequest,
} from "../types/maintenance-records";
import type { MaintenancePhoto, MaintenancePhotoType } from "../types/maintenance-photos";

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

  async uploadPhoto(
    machineId: string,
    recordId: string,
    type: MaintenancePhotoType,
    file: File,
  ): Promise<MaintenancePhoto> {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);

    const { data } = await http.post<MaintenancePhoto>(
      `/machines/${machineId}/maintenance-records/${recordId}/photos`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  },
};
