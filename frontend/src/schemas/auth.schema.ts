import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Senha é obrigatória."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
