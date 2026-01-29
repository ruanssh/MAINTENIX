import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("Informe um e-mail válido."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.union([z.literal(1), z.literal(2)], {
      required_error: "Selecione o perfil.",
    }),
  ),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
