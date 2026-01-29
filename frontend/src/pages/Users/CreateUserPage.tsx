import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AppLayout } from "../../layouts/AppLayout";
import { UsersService } from "../../services/users.service";
import { parseApiError } from "../../api/errors";
import {
  createUserSchema,
  type CreateUserFormValues,
} from "../../schemas/users.schema";

export function CreateUserPage() {
  const defaultValues = useMemo<CreateUserFormValues>(
    () => ({
      name: "",
      email: "",
      password: "",
      role: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await UsersService.create({
        ...values,
        role: Number(values.role) as 1 | 2,
      });
      toast.success("Usuário criado com sucesso.");
      reset(defaultValues);
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <AppLayout title="Usuários">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Criar usuário
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Preencha os dados para adicionar um novo usuário.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-slate-800">Nome</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
              placeholder="João Silva"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">E-mail</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
              placeholder="usuario@empresa.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Senha</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Perfil</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              {...register("role")}
            >
              <option value="">Selecione</option>
              <option value="1">Administrador</option>
              <option value="2">Usuário</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">
                {errors.role.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          >
            {isSubmitting ? "Criando..." : "Criar usuário"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
