import type { Id } from "./api";

export type MaintenanceRecordStatus = "PENDING" | "DONE";
export type MaintenanceRecordPriority = "LOW" | "MEDIUM" | "HIGH";
export type MaintenanceRecordCategory =
  | "ELETRICA"
  | "MECANICA"
  | "PNEUMATICA"
  | "PROCESSO"
  | "ELETRONICA"
  | "AUTOMACAO"
  | "PREDIAL"
  | "FERRAMENTARIA"
  | "REFRIGERACAO"
  | "SETUP"
  | "HIDRAULICA";
export type MaintenanceRecordShift = "PRIMEIRO" | "SEGUNDO" | "TERCEIRO";

export type MaintenanceRecord = {
  id: Id;
  machine_id: Id;
  created_by: Id;
  finished_by: Id | null;
  responsible_id: Id;
  status: MaintenanceRecordStatus;
  priority: MaintenanceRecordPriority;
  category: MaintenanceRecordCategory;
  shift: MaintenanceRecordShift;
  problem_description: string;
  solution_description: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MaintenanceRecordWithMachine = MaintenanceRecord & {
  machines: {
    id: Id;
    name: string;
  };
};

export type CreateMaintenanceRecordRequest = {
  problem_description: string;
  priority?: MaintenanceRecordPriority;
  category: MaintenanceRecordCategory;
  shift: MaintenanceRecordShift;
  responsible_id: Id;
  started_at?: string;
};

export type FinishMaintenanceRecordRequest = {
  solution_description: string;
  finished_at?: string;
};
