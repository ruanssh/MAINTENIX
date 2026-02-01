import { http } from "../api/http";
import type {
  MaintenanceRecord,
  MaintenanceRecordWithMachine,
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

  async listAll(): Promise<MaintenanceRecordWithMachine[]> {
    const { data } = await http.get<MaintenanceRecordWithMachine[]>(
      "/maintenance-records",
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

  async update(
    machineId: string,
    recordId: string,
    payload: CreateMaintenanceRecordRequest,
  ): Promise<MaintenanceRecord> {
    const { data } = await http.patch<MaintenanceRecord>(
      `/machines/${machineId}/maintenance-records/${recordId}`,
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
        timeout: 120_000,
      },
    );
    return data;
  },

  async listPhotos(
    machineId: string,
    recordId: string,
  ): Promise<MaintenancePhoto[]> {
    const { data } = await http.get<MaintenancePhoto[]>(
      `/machines/${machineId}/maintenance-records/${recordId}/photos`,
    );
    return data;
  },

  async removePhoto(
    machineId: string,
    recordId: string,
    photoId: string,
  ): Promise<MaintenancePhoto> {
    const { data } = await http.delete<MaintenancePhoto>(
      `/machines/${machineId}/maintenance-records/${recordId}/photos/${photoId}`,
    );
    return data;
  },
};
