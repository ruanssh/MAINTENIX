import type { Id } from "./api";

export type Machine = {
  id: Id;
  name: string;
  line: string | null;
  location: string | null;
  model: string | null;
  serial_number: string | null;
  photo_url: string | null;
  created_by: Id;
  created_at: string;
  updated_at: string;
};

export type CreateMachineRequest = {
  name: string;
  line?: string;
  location?: string;
  model?: string;
  serial_number?: string;
  photo_url?: string;
};

export type UpdateMachineRequest = CreateMachineRequest;
