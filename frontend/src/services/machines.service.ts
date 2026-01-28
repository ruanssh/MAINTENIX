import { http } from "../api/http";
import type {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
} from "../types/machines";

export const MachinesService = {
  async list(): Promise<Machine[]> {
    const { data } = await http.get<Machine[]>("/machines");
    return data;
  },

  async findById(id: string): Promise<Machine> {
    const { data } = await http.get<Machine>(`/machines/${id}`);
    return data;
  },

  async create(payload: CreateMachineRequest): Promise<Machine> {
    const { data } = await http.post<Machine>("/machines", payload);
    return data;
  },

  async update(id: string, payload: UpdateMachineRequest): Promise<Machine> {
    const { data } = await http.patch<Machine>(`/machines/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<Machine> {
    const { data } = await http.delete<Machine>(`/machines/${id}`);
    return data;
  },
};
