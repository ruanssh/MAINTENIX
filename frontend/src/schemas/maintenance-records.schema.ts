import { z } from "zod";

const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
const CATEGORY_VALUES = [
  "ELETRICA",
  "MECANICA",
  "PNEUMATICA",
  "PROCESSO",
  "ELETRONICA",
  "AUTOMACAO",
  "PREDIAL",
  "FERRAMENTARIA",
  "REFRIGERACAO",
  "SETUP",
  "HIDRAULICA",
] as const;
const SHIFT_VALUES = ["PRIMEIRO", "SEGUNDO", "TERCEIRO"] as const;

const requiredSelect = <T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) =>
  z
    .union([z.enum(values), z.literal("")])
    .refine((value) => value !== "", { message });

const optionalSelect = <T extends readonly [string, ...string[]]>(
  values: T,
) => z.union([z.enum(values), z.literal("")]);

export const createMaintenanceRecordSchema = z.object({
  problem_description: z.string().min(1, "Descreva a pendência."),
  priority: optionalSelect(PRIORITY_VALUES),
  category: requiredSelect(CATEGORY_VALUES, "Selecione a categoria."),
  shift: requiredSelect(SHIFT_VALUES, "Selecione o turno."),
  responsible_id: z
    .string()
    .min(1, "Selecione o responsável.")
    .refine((value) => /\d+/.test(value), "Responsável inválido."),
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
