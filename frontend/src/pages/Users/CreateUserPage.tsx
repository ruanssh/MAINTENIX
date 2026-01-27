import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { UsersService } from "../../services/users.service";
import { parseApiError } from "../../api/errors";
import {
  createUserSchema,
  type CreateUserFormValues,
} from "../../schemas/users.schema";

export function CreateUserPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultValues = useMemo<CreateUserFormValues>(
    () => ({ name: "", email: "", password: "" }),
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
    setError(null);
    setSuccess(null);
    try {
      await UsersService.create(values);
      setSuccess("User created successfully.");
      reset(defaultValues);
    } catch (e) {
      setError(parseApiError(e));
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Create User</h1>
          <p className="mt-1 text-sm opacity-70">
            Hidden route: /internal/users/new
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              placeholder="user@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              placeholder="••••••••"
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
            className="w-full rounded-lg border px-4 py-2 font-medium hover:bg-black/5 disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create user"}
          </button>
        </form>
      </div>
    </div>
  );
}
