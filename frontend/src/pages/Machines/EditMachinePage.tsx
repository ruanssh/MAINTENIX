import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AppLayout } from "../../layouts/AppLayout";
import { MachinesService } from "../../services/machines.service";
import { parseApiError } from "../../api/errors";
import {
  machineSchema,
  type MachineFormValues,
} from "../../schemas/machines.schema";
import type { Machine, UpdateMachineRequest } from "../../types/machines";

function normalizePayload(values: MachineFormValues): UpdateMachineRequest {
  const payload: UpdateMachineRequest = {
    name: values.name.trim(),
  };

  const optionalFields = [
    "line",
    "location",
    "model",
    "serial_number",
    "photo_url",
  ] as const;

  optionalFields.forEach((field) => {
    const value = values[field]?.trim();
    if (value) payload[field] = value;
  });

  return payload;
}

export function EditMachinePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [machine, setMachine] = useState<Machine | null>(null);

  const defaultValues = useMemo<MachineFormValues>(
    () => ({
      name: "",
      line: "",
      location: "",
      model: "",
      serial_number: "",
      photo_url: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadMachine() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await MachinesService.findById(id);
        setMachine(data);
        reset({
          name: data.name ?? "",
          line: data.line ?? "",
          location: data.location ?? "",
          model: data.model ?? "",
          serial_number: data.serial_number ?? "",
          photo_url: data.photo_url ?? "",
        });
      } catch (e) {
        toast.error(parseApiError(e));
        navigate("/machines", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    void loadMachine();
  }, [id, navigate, reset]);

  async function onSubmit(values: MachineFormValues) {
    if (!id) return;
    try {
      await MachinesService.update(id, normalizePayload(values));
      toast.success("Máquina atualizada.");
      navigate("/machines", { replace: true });
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <AppLayout title="Editar máquina">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Editar máquina
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {machine ? machine.name : "Carregando máquina..."}
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Carregando...</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium text-slate-800">Nome</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Extrusora DS"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Linha
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Linha 3"
                  {...register("line")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Local
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Setor B"
                  {...register("location")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Modelo
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="DS-3000"
                  {...register("model")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Número de série
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="SN-001-2025"
                  {...register("serial_number")}
                />
              </div>
            </div>

            {/* <div>
              <label className="text-sm font-medium text-slate-800">
                URL da foto
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="https://cdn.exemplo.com/machines/1.jpg"
                {...register("photo_url")}
              />
            </div> */}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/machines")}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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
