import type { Id } from "./api";

export type MaintenancePhotoType = "BEFORE" | "AFTER";

export type MaintenancePhoto = {
  id: Id;
  maintenance_record_id: Id;
  type: MaintenancePhotoType;
  file_url: string;
  created_by: Id;
  created_at: string;
};
