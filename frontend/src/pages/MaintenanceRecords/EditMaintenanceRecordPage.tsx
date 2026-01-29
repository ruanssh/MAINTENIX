import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";

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
  MaintenanceRecord,
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

type StoredPhoto = {
  id: string;
  url: string;
};

function normalizePayload(
  values: CreateMaintenanceRecordFormValues,
): CreateMaintenanceRecordRequest {
  return {
    problem_description: values.problem_description.trim(),
    priority: values.priority,
    category: values.category,
    shift: values.shift,
  };
}

export function EditMaintenanceRecordPage() {
  const { id, recordId } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [beforePhoto, setBeforePhoto] = useState<StoredPhoto | null>(null);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  const defaultValues = useMemo<CreateMaintenanceRecordFormValues>(
    () => ({
      problem_description: "",
      priority: "",
      category: "",
      shift: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMaintenanceRecordFormValues>({
    resolver: zodResolver(createMaintenanceRecordSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadData() {
      if (!id || !recordId) return;
      setLoading(true);
      try {
        const [machineData, recordData, photos] = await Promise.all([
          MachinesService.findById(id),
          MaintenanceRecordsService.findById(id, recordId),
          MaintenanceRecordsService.listPhotos(id, recordId),
        ]);
        if (recordData.status === "DONE") {
          toast.error("Pendência já finalizada.");
          navigate(`/machines/${id}/maintenance-records`, { replace: true });
          return;
        }
        const beforeStored = photos.find((photo) => photo.type === "BEFORE");
        setBeforePhoto(
          beforeStored ? { id: beforeStored.id, url: beforeStored.file_url } : null,
        );
        setMachine(machineData);
        setRecord(recordData);
        reset({
          problem_description: recordData.problem_description,
          priority: recordData.priority,
          category: recordData.category,
          shift: recordData.shift,
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

  async function handleRemovePhoto() {
    if (!id || !recordId || !beforePhoto) return;
    setIsRemovingPhoto(true);
    try {
      await MaintenanceRecordsService.removePhoto(
        id,
        recordId,
        beforePhoto.id,
      );
      setBeforePhoto(null);
      sessionStorage.removeItem(`maintenance-photo-before:${recordId}`);
      toast.success("Foto removida.");
    } catch (e) {
      toast.error(parseApiError(e));
    } finally {
      setIsRemovingPhoto(false);
    }
  }

  async function onSubmit(values: CreateMaintenanceRecordFormValues) {
    if (!id || !recordId) return;
    try {
      const updated = await MaintenanceRecordsService.update(
        id,
        recordId,
        normalizePayload(values),
      );
      setRecord(updated);

      if (photoFile) {
        if (beforePhoto) {
          await MaintenanceRecordsService.removePhoto(
            id,
            recordId,
            beforePhoto.id,
          );
        }
        const photo = await MaintenanceRecordsService.uploadPhoto(
          id,
          recordId,
          "BEFORE",
          photoFile,
        );
        setBeforePhoto({ id: photo.id, url: photo.file_url });
        sessionStorage.setItem(
          `maintenance-photo-before:${recordId}`,
          photo.file_url,
        );
        setPhotoFile(null);
      }

      toast.success("Pendência atualizada.");
      navigate(`/machines/${id}/maintenance-records`, { replace: true });
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  return (
    <AppLayout title="Editar pendência">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Editar pendência
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

        {loading || !record ? (
          <div className="text-sm text-slate-500">Carregando...</div>
        ) : (
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
                  <option value="">Selecione</option>
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Média</option>
                  <option value="LOW">Baixa</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.priority.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Turno
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  {...register("shift")}
                >
                  <option value="">Selecione</option>
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
                  <option value="">Selecione</option>
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

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Foto atual
                  </div>
                  <div className="text-xs text-slate-500">
                    Remova ou substitua a foto do problema.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={!beforePhoto || isRemovingPhoto}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <FiTrash2 />
                  {isRemovingPhoto ? "Removendo..." : "Remover foto"}
                </button>
              </div>
              <div className="mt-4 h-44 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {beforePhoto?.url ? (
                  <img
                    src={beforePhoto.url}
                    alt="Foto do problema"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Sem foto cadastrada
                  </div>
                )}
              </div>
            </div>

            <ImageUpload
              label="Nova foto do problema"
              hint="Opcional"
              value={photoFile}
              onChange={setPhotoFile}
            />

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
