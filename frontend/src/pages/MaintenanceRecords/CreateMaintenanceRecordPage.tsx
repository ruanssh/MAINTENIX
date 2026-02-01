import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FiArrowLeft, FiX } from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { ImageUpload } from "../../components/ImageUpload";
import { MachinesService } from "../../services/machines.service";
import { MaintenanceRecordsService } from "../../services/maintenance-records.service";
import { UsersService } from "../../services/users.service";
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
import type { User } from "../../types/users";

const CATEGORY_OPTIONS: Array<{
  value: MaintenanceRecordCategory;
  label: string;
}> = [
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
    category: values.category as CreateMaintenanceRecordRequest["category"],
    shift: values.shift as CreateMaintenanceRecordRequest["shift"],
    responsible_id: values.responsible_id,
  };

  if (values.priority) {
    payload.priority =
      values.priority as CreateMaintenanceRecordRequest["priority"];
  }

  return payload;
}

export function CreateMaintenanceRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const defaultValues = useMemo<CreateMaintenanceRecordFormValues>(
    () => ({
      problem_description: "",
      priority: "",
      category: "",
      shift: "",
      responsible_id: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateMaintenanceRecordFormValues>({
    resolver: zodResolver(createMaintenanceRecordSchema),
    defaultValues,
  });

  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const selectedResponsibleId = watch("responsible_id");

  const selectedResponsible = useMemo(() => {
    if (!selectedResponsibleId) return null;
    return users.find((user) => user.id === selectedResponsibleId) ?? null;
  }, [users, selectedResponsibleId]);

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

  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const data = await UsersService.list();
        setUsers(data.filter((user) => user.active));
      } catch (e) {
        toast.error(parseApiError(e));
      } finally {
        setLoadingUsers(false);
      }
    }

    void loadUsers();
  }, []);

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
            {loading ? "Carregando máquina..." : (machine?.name ?? "Máquina")}
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-800">
                Responsável
              </label>
              <input type="hidden" {...register("responsible_id")} />
              <div className="relative mt-1">
                <input
                  value={userSearch}
                  onChange={(event) => {
                    setUserSearch(event.target.value);
                    setIsUserListOpen(true);
                    setValue("responsible_id", "", { shouldValidate: true });
                  }}
                  onFocus={() => setIsUserListOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setIsUserListOpen(false), 150);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900"
                  placeholder="Pesquisar por nome ou e-mail"
                />
                {userSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearch("");
                      setValue("responsible_id", "", { shouldValidate: true });
                      setIsUserListOpen(false);
                    }}
                    className="absolute right-2 top-5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Limpar responsável"
                    title="Limpar"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
                {selectedResponsible && !isUserListOpen && (
                  <div className="mt-2 text-xs text-slate-500">
                    Selecionado: {selectedResponsible.name} ·{" "}
                    {selectedResponsible.email}
                  </div>
                )}
                {isUserListOpen && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="max-h-56 overflow-auto">
                      {loadingUsers ? (
                        <div className="px-3 py-2 text-xs text-slate-500">
                          Carregando usuários...
                        </div>
                      ) : users.filter((user) => {
                          const query = userSearch.trim().toLowerCase();
                          if (!query) return true;
                          return (
                            user.name.toLowerCase().includes(query) ||
                            user.email.toLowerCase().includes(query)
                          );
                        }).length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-500">
                          Nenhum usuário encontrado.
                        </div>
                      ) : (
                        users
                          .filter((user) => {
                            const query = userSearch.trim().toLowerCase();
                            if (!query) return true;
                            return (
                              user.name.toLowerCase().includes(query) ||
                              user.email.toLowerCase().includes(query)
                            );
                          })
                          .map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setValue("responsible_id", user.id, {
                                  shouldValidate: true,
                                });
                                setUserSearch(`${user.name} · ${user.email}`);
                                setIsUserListOpen(false);
                              }}
                              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-50"
                            >
                              <span className="font-medium">{user.name}</span>
                              <span className="text-xs text-slate-500">
                                {user.email}
                              </span>
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.responsible_id && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.responsible_id.message}
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
            onError={(message) => toast.error(message)}
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
