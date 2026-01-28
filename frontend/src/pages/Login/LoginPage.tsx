import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import maintenixLogo from "../../assets/maintenix.svg";
import { useAuth } from "../../auth/AuthContext";
import { parseApiError } from "../../api/errors";
import { loginSchema, type LoginFormValues } from "../../schemas/auth.schema";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const defaultValues = useMemo<LoginFormValues>(
    () => ({ email: "", password: "" }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex h-12 items-center justify-center">
          <img
            src={maintenixLogo}
            alt="MAINTENIX"
            className="h-8 w-auto translate-y-[1px]"
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-slate-800">E-mail</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="voce@empresa.com"
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
            <label className="text-sm font-medium text-slate-800">
              Senha
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
