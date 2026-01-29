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
import { UsersService } from "../../services/users.service";
import { parseApiError } from "../../api/errors";
import {
  finishMaintenanceRecordSchema,
  type FinishMaintenanceRecordFormValues,
} from "../../schemas/maintenance-records.schema";
import type { Machine } from "../../types/machines";
import type {
  FinishMaintenanceRecordRequest,
  MaintenanceRecord,
  MaintenanceRecordCategory,
  MaintenanceRecordShift,
} from "../../types/maintenance-records";
import type { User } from "../../types/users";

const CATEGORY_LABELS = new Map<MaintenanceRecordCategory, string>([
  ["ELETRICA", "Elétrica"],
  ["MECANICA", "Mecânica"],
  ["PNEUMATICA", "Pneumática"],
  ["PROCESSO", "Processo"],
  ["ELETRONICA", "Eletrônica"],
  ["AUTOMACAO", "Automação"],
  ["PREDIAL", "Predial"],
  ["FERRAMENTARIA", "Ferramentaria"],
  ["REFRIGERACAO", "Refrigeração"],
  ["SETUP", "Setup"],
  ["HIDRAULICA", "Hidráulica"],
]);

const SHIFT_LABELS = new Map<MaintenanceRecordShift, string>([
  ["PRIMEIRO", "Primeiro"],
  ["SEGUNDO", "Segundo"],
  ["TERCEIRO", "Terceiro"],
]);

function ImagePreviewCard({
  title,
  imageUrl,
  onPreview,
  className = "",
}: {
  title: string;
  imageUrl: string | null;
  onPreview: (url: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs font-semibold uppercase text-slate-500">
        {title}
      </div>
      <button
        type="button"
        onClick={() => imageUrl && onPreview(imageUrl)}
        className="mt-2 flex h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 transition hover:border-slate-300"
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

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
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
  const [usersById, setUsersById] = useState<Map<string, User>>(new Map());

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
        const photos = await MaintenanceRecordsService.listPhotos(
          id,
          recordId,
        );
        setMachine(machineData);
        setRecord(recordData);
        const beforePhoto = photos.find((photo) => photo.type === "BEFORE");
        const afterPhoto = photos.find((photo) => photo.type === "AFTER");
        if (beforePhoto) setBeforePhotoUrl(beforePhoto.file_url);
        if (afterPhoto) setAfterPhotoUrl(afterPhoto.file_url);
        if (!beforePhoto) {
          const beforeStored = sessionStorage.getItem(
            `maintenance-photo-before:${recordData.id}`,
          );
          if (beforeStored) setBeforePhotoUrl(beforeStored);
        }
        if (!afterPhoto) {
          const afterStored = sessionStorage.getItem(
            `maintenance-photo-after:${recordData.id}`,
          );
          if (afterStored) setAfterPhotoUrl(afterStored);
        }
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

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await UsersService.list();
        setUsersById(new Map(data.map((user) => [user.id, user])));
      } catch (e) {
        toast.error(parseApiError(e));
      }
    }

    void loadUsers();
  }, []);

  const responsibleName = record
    ? usersById.get(record.responsible_id)?.name ?? `#${record.responsible_id}`
    : "-";
  const finishedByName = record?.finished_by
    ? usersById.get(record.finished_by)?.name ?? `#${record.finished_by}`
    : "-";

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
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  Pendência
                </h2>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {record.status === "DONE" ? "Resolvida" : "Pendente"}
                </span>
              </div>

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
                  <MetaItem
                    label="Prioridade"
                    value={
                      record.priority === "HIGH"
                        ? "Alta"
                        : record.priority === "LOW"
                          ? "Baixa"
                          : "Média"
                    }
                  />
                  <MetaItem
                    label="Turno"
                    value={SHIFT_LABELS.get(record.shift) ?? record.shift}
                  />
                  <MetaItem
                    label="Categoria"
                    value={
                      CATEGORY_LABELS.get(record.category) ?? record.category
                    }
                  />
                  <MetaItem label="Responsável" value={responsibleName} />
                  <MetaItem
                    label="Criada em"
                    value={formatDateTime(record.created_at)}
                  />
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
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  Resolução
                </h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  {record.status === "DONE" ? "Finalizada" : "Em andamento"}
                </span>
              </div>

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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetaItem
                      label="Finalizado em"
                      value={formatDateTime(record.finished_at)}
                    />
                    <MetaItem label="Finalizado por" value={finishedByName} />
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
