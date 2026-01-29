import { z } from "zod";

const roleSchema = z
  .union([z.literal("1"), z.literal("2"), z.literal("")])
  .refine((value) => value !== "", { message: "Selecione o perfil." });

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("Informe um e-mail válido."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: roleSchema,
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
