import type { Id } from "./api";

export type MaintenanceRecordStatus = "PENDING" | "DONE";
export type MaintenanceRecordPriority = "LOW" | "MEDIUM" | "HIGH";

export type MaintenanceRecord = {
  id: Id;
  machine_id: Id;
  created_by: Id;
  finished_by: Id | null;
  status: MaintenanceRecordStatus;
  priority: MaintenanceRecordPriority;
  problem_description: string;
  solution_description: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateMaintenanceRecordRequest = {
  problem_description: string;
  priority?: MaintenanceRecordPriority;
  started_at?: string;
};

export type FinishMaintenanceRecordRequest = {
  solution_description: string;
  finished_at?: string;
};
