import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FiArrowLeft } from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { ImageUpload } from "../../components/ImageUpload";
import { MachinesService } from "../../services/machines.service";
import { MaintenanceRecordsService } from "../../services/maintenance-records.service";
import { parseApiError } from "../../api/errors";
import {
  createMaintenanceRecordSchema,
  type CreateMaintenanceRecordFormValues,
} from "../../schemas/maintenance-records.schema";
import type { Machine } from "../../types/machines";
import type {
  CreateMaintenanceRecordRequest,
  MaintenanceRecordCategory,
  MaintenanceRecordShift,
} from "../../types/maintenance-records";

const CATEGORY_OPTIONS: Array<{ value: MaintenanceRecordCategory; label: string }> = [
  { value: "ELETRICA", label: "Elétrica" },
  { value: "MECANICA", label: "Mecânica" },
  { value: "PNEUMATICA", label: "Pneumática" },
  { value: "PROCESSO", label: "Processo" },
  { value: "ELETRONICA", label: "Eletrônica" },
  { value: "AUTOMACAO", label: "Automação" },
  { value: "PREDIAL", label: "Predial" },
  { value: "FERRAMENTARIA", label: "Ferramentaria" },
  { value: "REFRIGERACAO", label: "Refrigeração" },
  { value: "SETUP", label: "Setup" },
  { value: "HIDRAULICA", label: "Hidráulica" },
];

const SHIFT_OPTIONS: Array<{ value: MaintenanceRecordShift; label: string }> = [
  { value: "PRIMEIRO", label: "Primeiro" },
  { value: "SEGUNDO", label: "Segundo" },
  { value: "TERCEIRO", label: "Terceiro" },
];

function normalizePayload(
  values: CreateMaintenanceRecordFormValues,
): CreateMaintenanceRecordRequest {
  const payload: CreateMaintenanceRecordRequest = {
    problem_description: values.problem_description.trim(),
    category: values.category,
    shift: values.shift,
  };

  if (values.priority) payload.priority = values.priority;

  return payload;
}

export function CreateMaintenanceRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const defaultValues = useMemo<CreateMaintenanceRecordFormValues>(
    () => ({
      problem_description: "",
      priority: "MEDIUM",
      category: "MECANICA",
      shift: "PRIMEIRO",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMaintenanceRecordFormValues>({
    resolver: zodResolver(createMaintenanceRecordSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadMachine() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await MachinesService.findById(id);
        setMachine(data);
      } catch (e) {
        toast.error(parseApiError(e));
        navigate("/machines", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    void loadMachine();
  }, [id, navigate]);

  async function onSubmit(values: CreateMaintenanceRecordFormValues) {
    if (!id) return;
    if (!photoFile) {
      toast.error("Envie a foto da pendência.");
      return;
    }
    try {
      const record = await MaintenanceRecordsService.create(
        id,
        normalizePayload(values),
      );
      const photo = await MaintenanceRecordsService.uploadPhoto(
        id,
        record.id,
        "BEFORE",
        photoFile,
      );
      sessionStorage.setItem(
        `maintenance-photo-before:${record.id}`,
        photo.file_url,
      );
      toast.success("Pendência criada.");
      navigate(`/machines/${id}/maintenance-records`, { replace: true });
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <AppLayout title="Nova pendência">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Nova pendência
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {loading
              ? "Carregando máquina..."
              : machine?.name ?? "Máquina"}
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

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-slate-800">
              Descrição da pendência
            </label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Descreva o problema encontrado"
              {...register("problem_description")}
            />
            {errors.problem_description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.problem_description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-800">
                Prioridade
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                {...register("priority")}
              >
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Média</option>
                <option value="LOW">Baixa</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">
                Turno
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                {...register("shift")}
              >
                {SHIFT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.shift && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.shift.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-800">
                Categoria
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                {...register("category")}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <ImageUpload
            label="Foto do problema"
            hint="Obrigatório"
            required
            value={photoFile}
            onChange={setPhotoFile}
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Criar pendência"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
