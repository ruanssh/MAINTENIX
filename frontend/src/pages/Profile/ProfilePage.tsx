import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { AppLayout } from "../../layouts/AppLayout";
import { useAuth } from "../../auth/AuthContext";
import { UsersService } from "../../services/users.service";
import { parseApiError } from "../../api/errors";

const changePasswordSchema = z
  .object({
    current_password: z.string().min(6, "Informe a senha atual."),
    new_password: z.string().min(6, "A nova senha deve ter 6 caracteres."),
    confirm_password: z.string().min(6, "Confirme a nova senha."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não conferem.",
    path: ["confirm_password"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ProfilePage() {
  const { user } = useAuth();

  const defaultValues = useMemo<ChangePasswordFormValues>(
    () => ({
      current_password: "",
      new_password: "",
      confirm_password: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues,
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await UsersService.changePassword(
        values.current_password,
        values.new_password,
      );
      toast.success("Senha atualizada.");
      reset(defaultValues);
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <AppLayout title="Meu perfil">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Meu perfil</h1>
          <p className="mt-1 text-sm text-slate-600">
            Informações da sua conta.
          </p>

          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500">
                Nome
              </span>
              <div className="mt-1 font-medium text-slate-900">
                {user?.name ?? "-"}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500">
                Email
              </span>
              <div className="mt-1 font-medium text-slate-900">
                {user?.email ?? "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Trocar senha
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use uma senha com pelo menos 6 caracteres.
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium text-slate-800">
                Senha atual
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                {...register("current_password")}
              />
              {errors.current_password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Nova senha
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  {...register("new_password")}
                />
                {errors.new_password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.new_password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  {...register("confirm_password")}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {isSubmitting ? "Salvando..." : "Atualizar senha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
