import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FiArrowLeft } from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { UsersService } from "../../services/users.service";
import { parseApiError } from "../../api/errors";
import type { User, UpdateUserRequest } from "../../types/users";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("Informe um e-mail válido."),
  role: z
    .union([z.literal("1"), z.literal("2"), z.literal("")])
    .refine((value) => value !== "", { message: "Selecione o perfil." }),
  active: z
    .union([z.literal("true"), z.literal("false"), z.literal("")])
    .refine((value) => value !== "", { message: "Selecione o status." }),
});

type UpdateUserFormValues = z.input<typeof updateUserSchema>;

export function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultValues = useMemo<UpdateUserFormValues>(
    () => ({
      name: "",
      email: "",
      role: "",
      active: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadUser() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await UsersService.findById(id);
        setUser(data);
        reset({
          name: data.name,
          email: data.email,
          role: String(data.role) as UpdateUserFormValues["role"],
          active: String(data.active) as UpdateUserFormValues["active"],
        });
      } catch (e) {
        toast.error(parseApiError(e));
        navigate("/users", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [id, navigate, reset]);

  async function onSubmit(values: UpdateUserFormValues) {
    if (!id) return;
    if (!values.role || !values.active) return;
    const payload: UpdateUserRequest = {
      name: values.name.trim(),
      email: values.email.trim(),
      role: Number(values.role) as 1 | 2,
      active: values.active === "true",
    };
    try {
      const updated = await UsersService.update(id, payload);
      setUser(updated);
      toast.success("Usuário atualizado.");
      navigate("/users", { replace: true });
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <AppLayout title="Editar usuário">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Editar usuário
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {user ? user.name : "Carregando usuário..."}
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FiArrowLeft className="text-slate-600" />
            Voltar
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Carregando...</div>
        ) : (
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

            <div className="grid gap-4 md:grid-cols-2">
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

              <div>
                <label className="text-sm font-medium text-slate-800">Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  {...register("active")}
                >
                  <option value="">Selecione</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
                {errors.active && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.active.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
