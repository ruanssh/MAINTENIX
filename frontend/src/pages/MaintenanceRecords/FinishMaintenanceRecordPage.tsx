import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FiArrowLeft } from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { MachinesService } from "../../services/machines.service";
import { MaintenanceRecordsService } from "../../services/maintenance-records.service";
import { parseApiError } from "../../api/errors";
import {
  finishMaintenanceRecordSchema,
  type FinishMaintenanceRecordFormValues,
} from "../../schemas/maintenance-records.schema";
import type { Machine } from "../../types/machines";
import type {
  FinishMaintenanceRecordRequest,
  MaintenanceRecord,
} from "../../types/maintenance-records";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function formatInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function normalizePayload(
  values: FinishMaintenanceRecordFormValues,
): FinishMaintenanceRecordRequest {
  const payload: FinishMaintenanceRecordRequest = {
    solution_description: values.solution_description.trim(),
  };

  if (values.finished_at?.trim()) {
    payload.finished_at = new Date(values.finished_at).toISOString();
  }

  return payload;
}

export function FinishMaintenanceRecordPage() {
  const { id, recordId } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultValues = useMemo<FinishMaintenanceRecordFormValues>(
    () => ({
      solution_description: "",
      finished_at: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FinishMaintenanceRecordFormValues>({
    resolver: zodResolver(finishMaintenanceRecordSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadData() {
      if (!id || !recordId) return;
      setLoading(true);
      try {
        const [machineData, recordData] = await Promise.all([
          MachinesService.findById(id),
          MaintenanceRecordsService.findById(id, recordId),
        ]);
        setMachine(machineData);
        setRecord(recordData);
        reset({
          solution_description: recordData.solution_description ?? "",
          finished_at: formatInputDateTime(recordData.finished_at),
        });
      } catch (e) {
        toast.error(parseApiError(e));
        navigate(`/machines/${id}/maintenance-records`, { replace: true });
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id, recordId, navigate, reset]);

  async function onSubmit(values: FinishMaintenanceRecordFormValues) {
    if (!id || !recordId) return;
    try {
      await MaintenanceRecordsService.finish(id, recordId, normalizePayload(values));
      toast.success("Pendência finalizada.");
      navigate(`/machines/${id}/maintenance-records`, { replace: true });
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <AppLayout title="Resolução">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {record?.status === "DONE" ? "Resolução" : "Resolver pendência"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {machine ? machine.name : "Carregando máquina..."}
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

        {loading || !record ? (
          <div className="text-sm text-slate-500">Carregando...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-sm font-semibold text-slate-800">
                Pendência
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Descrição
                  </span>
                  <p className="mt-1 whitespace-pre-wrap">
                    {record.problem_description}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Prioridade
                    </span>
                    <p className="mt-1">
                      {record.priority === "HIGH"
                        ? "Alta"
                        : record.priority === "LOW"
                          ? "Baixa"
                          : "Média"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Status
                    </span>
                    <p className="mt-1">
                      {record.status === "DONE" ? "Resolvida" : "Pendente"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Criada em
                    </span>
                    <p className="mt-1">{formatDateTime(record.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Início
                    </span>
                    <p className="mt-1">{formatDateTime(record.started_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={[
                "rounded-xl border border-slate-200 p-5 transition",
                record.status === "DONE"
                  ? "bg-slate-50 opacity-80"
                  : "bg-white",
              ].join(" ")}
            >
              <h2 className="text-sm font-semibold text-slate-800">Resolução</h2>
              <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Descrição da solução
                  </label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    placeholder="Descreva o que foi feito"
                    disabled={record.status === "DONE"}
                    {...register("solution_description")}
                  />
                  {errors.solution_description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.solution_description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Finalizado em (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    disabled={record.status === "DONE"}
                    {...register("finished_at")}
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    disabled={record.status === "DONE" || isSubmitting}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {record.status === "DONE"
                      ? "Finalizada"
                      : isSubmitting
                        ? "Salvando..."
                        : "Finalizar pendência"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
