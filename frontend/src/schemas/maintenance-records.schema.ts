import { z } from "zod";

export const createMaintenanceRecordSchema = z.object({
  problem_description: z.string().min(1, "Descreva a pendência."),
  priority: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["LOW", "MEDIUM", "HIGH"], {
      required_error: "Selecione a prioridade.",
    }),
  ),
  category: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(
      [
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
      ],
      { required_error: "Selecione a categoria." },
    ),
  ),
  shift: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["PRIMEIRO", "SEGUNDO", "TERCEIRO"], {
      required_error: "Selecione o turno.",
    }),
  ),
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
