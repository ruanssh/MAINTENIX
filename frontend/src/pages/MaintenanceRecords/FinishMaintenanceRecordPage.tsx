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
  finishMaintenanceRecordSchema,
  type FinishMaintenanceRecordFormValues,
} from "../../schemas/maintenance-records.schema";
import type { Machine } from "../../types/machines";
import type {
  FinishMaintenanceRecordRequest,
  MaintenanceRecord,
} from "../../types/maintenance-records";

function ImagePreviewCard({
  title,
  imageUrl,
  onPreview,
}: {
  title: string;
  imageUrl: string | null;
  onPreview: (url: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-slate-500">
        {title}
      </div>
      <button
        type="button"
        onClick={() => imageUrl && onPreview(imageUrl)}
        className="mt-2 flex h-56 w-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 transition hover:border-slate-300"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          "Sem imagem"
        )}
      </button>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function normalizePayload(
  values: FinishMaintenanceRecordFormValues,
): FinishMaintenanceRecordRequest {
  const payload: FinishMaintenanceRecordRequest = {
    solution_description: values.solution_description.trim(),
  };

  return payload;
}

export function FinishMaintenanceRecordPage() {
  const { id, recordId } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string | null>(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const defaultValues = useMemo<FinishMaintenanceRecordFormValues>(
    () => ({
      solution_description: "",
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
        const beforeStored = sessionStorage.getItem(
          `maintenance-photo-before:${recordData.id}`,
        );
        const afterStored = sessionStorage.getItem(
          `maintenance-photo-after:${recordData.id}`,
        );
        if (beforeStored) setBeforePhotoUrl(beforeStored);
        if (afterStored) setAfterPhotoUrl(afterStored);
        reset({
          solution_description: recordData.solution_description ?? "",
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
    if (!afterPhotoFile) {
      toast.error("Envie a foto da resolução.");
      return;
    }
    try {
      await MaintenanceRecordsService.finish(
        id,
        recordId,
        normalizePayload(values),
      );
      const photo = await MaintenanceRecordsService.uploadPhoto(
        id,
        recordId,
        "AFTER",
        afterPhotoFile,
      );
      setAfterPhotoUrl(photo.file_url);
      sessionStorage.setItem(
        `maintenance-photo-after:${recordId}`,
        photo.file_url,
      );
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
              <div className="mt-4">
                <ImagePreviewCard
                  title="Foto do problema"
                  imageUrl={beforePhotoUrl}
                  onPreview={setPreviewUrl}
                />
              </div>
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
              <h2 className="text-sm font-semibold text-slate-800">
                Resolução
              </h2>

              {record.status === "DONE" ? (
                <div className="mt-4 space-y-4 text-sm text-slate-700">
                  <ImagePreviewCard
                    title="Foto da resolução"
                    imageUrl={afterPhotoUrl}
                    onPreview={setPreviewUrl}
                  />

                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Descrição da solução
                    </span>
                    <p className="mt-1 whitespace-pre-wrap">
                      {record.solution_description ?? "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Finalizado em
                    </span>
                    <p className="mt-1">{formatDateTime(record.finished_at)}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-4">
                    <ImageUpload
                      label="Foto da resolução"
                      hint="Obrigatório"
                      required
                      value={afterPhotoFile}
                      previewUrl={afterPhotoUrl}
                      onChange={setAfterPhotoFile}
                    />
                  </div>
                  <form
                    className="mt-4 space-y-4"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <div>
                      <label className="text-sm font-medium text-slate-800">
                        Descrição da solução
                      </label>
                      <textarea
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        placeholder="Descreva o que foi feito"
                        {...register("solution_description")}
                      />
                      {errors.solution_description && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.solution_description.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        {isSubmitting ? "Salvando..." : "Finalizar pendência"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar preview"
            onClick={() => setPreviewUrl(null)}
            className="absolute inset-0 bg-black/70"
          />
          <div
            className="absolute inset-0 flex items-center justify-center p-6"
            onClick={() => setPreviewUrl(null)}
          >
            <div
              className="max-h-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={previewUrl}
                alt="Pré-visualização"
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
