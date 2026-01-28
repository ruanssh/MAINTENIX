import { z } from "zod";

export const createMaintenanceRecordSchema = z.object({
  problem_description: z.string().min(1, "Descreva a pendência."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const finishMaintenanceRecordSchema = z.object({
  solution_description: z.string().min(1, "Descreva a solução."),
});

export type CreateMaintenanceRecordFormValues = z.infer<
  typeof createMaintenanceRecordSchema
>;
export type FinishMaintenanceRecordFormValues = z.infer<
  typeof finishMaintenanceRecordSchema
>;
