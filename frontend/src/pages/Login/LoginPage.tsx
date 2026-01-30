import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import maintenixLogo from "../../assets/maintenix.svg";
import maintenixLogoDark from "../../assets/maintenix-dark.svg";
import { useAuth } from "../../auth/AuthContext";
import { parseApiError } from "../../api/errors";
import {
  loginSchema,
  resetPasswordSchema,
  type LoginFormValues,
  type ResetPasswordFormValues,
} from "../../schemas/auth.schema";
import { AuthService } from "../../services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showReset, setShowReset] = useState(false);

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

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors, isSubmitting: isResetting },
    reset: resetResetForm,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  async function onReset(values: ResetPasswordFormValues) {
    try {
      await AuthService.resetPassword(values);
      toast.success("Enviamos uma nova senha para o seu e-mail.");
      resetResetForm({ email: "" });
      setShowReset(false);
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
            className="logo-light h-8 w-auto translate-y-[1px]"
          />
          <img
            src={maintenixLogoDark}
            alt="MAINTENIX"
            className="logo-dark h-8 w-auto translate-y-[1px]"
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

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setShowReset((prev) => !prev)}
            className="text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            {showReset ? "Voltar ao login" : "Esqueci minha senha"}
          </button>
        </div>

        {showReset && (
          <form
            className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
            onSubmit={handleSubmitReset(onReset)}
          >
            <div>
              <label className="text-sm font-medium text-slate-800">
                E-mail cadastrado
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="voce@empresa.com"
                autoComplete="email"
                {...registerReset("email")}
              />
              {resetErrors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {resetErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
            >
              {isResetting ? "Enviando..." : "Enviar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
