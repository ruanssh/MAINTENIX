import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FiFilter, FiInbox } from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { UsersService } from "../../services/users.service";
import { parseApiError } from "../../api/errors";
import type {
  MaintenanceRecordCategory,
  MaintenanceRecordPriority,
  MaintenanceRecordShift,
  MaintenanceRecordStatus,
  MaintenanceRecordWithMachine,
} from "../../types/maintenance-records";

type FiltersState = {
  query: string;
  status: "all" | MaintenanceRecordStatus;
  priority: "all" | MaintenanceRecordPriority;
  category: "all" | MaintenanceRecordCategory;
  shift: "all" | MaintenanceRecordShift;
  machine: "" | string;
};

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

const CATEGORY_LABELS = new Map(
  CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
);
const SHIFT_LABELS = new Map(
  SHIFT_OPTIONS.map((option) => [option.value, option.label]),
);

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function StatusBadge({ status }: { status: MaintenanceRecordStatus }) {
  const styles =
    status === "DONE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  const label = status === "DONE" ? "Resolvida" : "Pendente";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: MaintenanceRecordPriority }) {
  const styles =
    priority === "HIGH"
      ? "border-red-200 bg-red-50 text-red-700"
      : priority === "LOW"
        ? "border-slate-200 bg-slate-50 text-slate-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  const label =
    priority === "HIGH" ? "Alta" : priority === "LOW" ? "Baixa" : "Média";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {label}
    </span>
  );
}

export function UserInboxPage() {
  const [records, setRecords] = useState<MaintenanceRecordWithMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [machineSearch, setMachineSearch] = useState("");
  const [isMachineListOpen, setIsMachineListOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    query: "",
    status: "all",
    priority: "all",
    category: "all",
    shift: "all",
    machine: "",
  });

  useEffect(() => {
    async function loadInbox() {
      setLoading(true);
      try {
        const data = await UsersService.listAssignedMaintenanceRecords();
        setRecords(data);
        setPage(1);
      } catch (e) {
        toast.error(parseApiError(e));
      } finally {
        setLoading(false);
      }
    }

    void loadInbox();
  }, []);

  const machines = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>();
    records.forEach((record) => {
      if (record.machines?.id) {
        unique.set(record.machines.id, {
          id: record.machines.id,
          name: record.machines.name,
        });
      }
    });
    return Array.from(unique.values());
  }, [records]);

  const selectedMachine = useMemo(() => {
    if (!filters.machine) return null;
    return machines.find((machine) => machine.id === filters.machine) ?? null;
  }, [filters.machine, machines]);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.query,
      filters.status !== "all" ? "1" : "",
      filters.priority !== "all" ? "1" : "",
      filters.category !== "all" ? "1" : "",
      filters.shift !== "all" ? "1" : "",
      filters.machine ? "1" : "",
    ].filter(Boolean).length;
  }, [filters]);

  const filteredRecords = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesQuery = query
        ? record.problem_description.toLowerCase().includes(query)
        : true;

      const matchesStatus =
        filters.status === "all" ? true : record.status === filters.status;

      const matchesPriority =
        filters.priority === "all"
          ? true
          : record.priority === filters.priority;

      const matchesCategory =
        filters.category === "all"
          ? true
          : record.category === filters.category;

      const matchesShift =
        filters.shift === "all" ? true : record.shift === filters.shift;

      const matchesMachine = filters.machine
        ? record.machines?.id === filters.machine
        : true;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesShift &&
        matchesMachine
      );
    });
  }, [records, filters]);

  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);

  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, currentPage, perPage]);

  const pageButtons = useMemo(() => {
    const buttons: number[] = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i += 1) buttons.push(i);
    return buttons;
  }, [currentPage, totalPages]);

  function handlePerPageChange(value: string) {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return;
    setPerPage(next);
    setPage(1);
  }

  function handleFilterChange(field: keyof FiltersState, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  }

  function handleClearFilters() {
    setFilters({
      query: "",
      status: "all",
      priority: "all",
      category: "all",
      shift: "all",
      machine: "",
    });
    setMachineSearch("");
    setPage(1);
  }

  return (
    <AppLayout title="Minhas pendências">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Minhas pendências
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Pendências atribuídas a você.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                <FiFilter className="text-slate-600" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-semibold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <select
                value={perPage}
                onChange={(event) => handlePerPageChange(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!loading && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {activeFiltersCount > 0 ? (
              <>
                <span className="text-xs font-medium text-slate-500">
                  Filtros ativos:
                </span>
                {filters.query && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Busca: {filters.query}
                  </span>
                )}
                {filters.status !== "all" && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Status:{" "}
                    {filters.status === "PENDING" ? "Pendente" : "Resolvida"}
                  </span>
                )}
                {filters.priority !== "all" && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Prioridade: {filters.priority}
                  </span>
                )}
                {filters.shift !== "all" && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Turno: {SHIFT_LABELS.get(filters.shift) ?? filters.shift}
                  </span>
                )}
                {filters.category !== "all" && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Categoria:{" "}
                    {CATEGORY_LABELS.get(filters.category) ?? filters.category}
                  </span>
                )}
                {filters.machine && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Máquina: {selectedMachine?.name ?? filters.machine}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="ml-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Limpar
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-500">
                Nenhum filtro aplicado.
              </span>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:hidden">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Carregando pendências...
            </div>
          )}

          {!loading && records.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Nenhuma pendência atribuída.
            </div>
          )}

          {!loading && records.length > 0 && totalItems === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Nenhuma pendência encontrada com os filtros atuais.
            </div>
          )}

          {!loading &&
            pagedRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {record.id}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 font-semibold text-slate-900">
                          {record.problem_description}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      {record.machines?.name ?? "-"}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={record.status} />
                      <PriorityBadge priority={record.priority} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>
                        Turno: {SHIFT_LABELS.get(record.shift) ?? record.shift}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>
                        Categoria:{" "}
                        {CATEGORY_LABELS.get(record.category) ??
                          record.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Link
                      to={`/machines/${record.machine_id}/maintenance-records/${record.id}`}
                      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-semibold ${
                        record.status === "DONE"
                          ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {record.status === "DONE" ? "Ver" : "Resolver"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-separate border-spacing-0 text-left text-sm md:min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">
                    Pendência
                  </th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">
                    Máquina
                  </th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Status</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3 hidden md:table-cell">
                    Turno
                  </th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3 hidden md:table-cell">
                    Categoria
                  </th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">
                    Prioridade
                  </th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3 hidden lg:table-cell">
                    Criada em
                  </th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Carregando pendências...
                    </td>
                  </tr>
                )}

                {!loading && records.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Nenhuma pendência atribuída.
                    </td>
                  </tr>
                )}

                {!loading && records.length > 0 && totalItems === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Nenhuma pendência encontrada com os filtros atuais.
                    </td>
                  </tr>
                )}

                {!loading &&
                  pagedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {record.id}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 font-semibold text-slate-900">
                              {record.problem_description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          {record.machines?.name ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-4 text-slate-600 hidden md:table-cell">
                        {SHIFT_LABELS.get(record.shift) ?? record.shift}
                      </td>
                      <td className="px-4 py-4 text-slate-600 hidden md:table-cell">
                        {CATEGORY_LABELS.get(record.category) ??
                          record.category}
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={record.priority} />
                      </td>
                      <td className="px-4 py-4 text-slate-600 hidden lg:table-cell">
                        {formatDateTime(record.created_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/machines/${record.machine_id}/maintenance-records/${record.id}`}
                          className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-semibold ${
                            record.status === "DONE"
                              ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          {record.status === "DONE" ? "Visualizar" : "Resolver"}
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && totalItems > 0 && (
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
              Mostrando {(currentPage - 1) * perPage + 1} -{" "}
              {Math.min(currentPage * perPage, totalItems)} de {totalItems}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>

              {pageButtons.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={[
                    "rounded-lg border px-3 py-1.5 text-sm font-medium",
                    pageNumber === currentPage
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Filtros
                </h2>
                <p className="text-xs text-slate-500">
                  Ajuste os filtros para refinar a lista.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            <div className="h-[calc(100%-140px)] overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Busca
                  </label>
                  <input
                    value={filters.query}
                    onChange={(event) =>
                      handleFilterChange("query", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    placeholder="Ex: vazamento, troca, ajuste"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Máquina
                  </label>
                  <div className="relative mt-1">
                    <input
                      value={machineSearch}
                      onChange={(event) => {
                        setMachineSearch(event.target.value);
                        setIsMachineListOpen(true);
                        handleFilterChange("machine", "");
                      }}
                      onFocus={() => setIsMachineListOpen(true)}
                      onBlur={() => {
                        setTimeout(() => setIsMachineListOpen(false), 150);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900"
                      placeholder="Pesquisar por máquina"
                    />
                    {machineSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setMachineSearch("");
                          handleFilterChange("machine", "");
                          setIsMachineListOpen(false);
                        }}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Limpar máquina"
                        title="Limpar"
                      >
                        ×
                      </button>
                    )}
                    {isMachineListOpen && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                        <div className="max-h-56 overflow-auto">
                          {machines.filter((machine) => {
                            const query = machineSearch.trim().toLowerCase();
                            if (!query) return true;
                            return machine.name.toLowerCase().includes(query);
                          }).length === 0 ? (
                            <div className="px-3 py-2 text-xs text-slate-500">
                              Nenhuma máquina encontrada.
                            </div>
                          ) : (
                            machines
                              .filter((machine) => {
                                const query = machineSearch
                                  .trim()
                                  .toLowerCase();
                                if (!query) return true;
                                return machine.name
                                  .toLowerCase()
                                  .includes(query);
                              })
                              .map((machine) => (
                                <button
                                  key={machine.id}
                                  type="button"
                                  onClick={() => {
                                    handleFilterChange("machine", machine.id);
                                    setMachineSearch(machine.name);
                                    setIsMachineListOpen(false);
                                  }}
                                  className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-50"
                                >
                                  {machine.name}
                                </button>
                              ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      handleFilterChange("status", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Todos</option>
                    <option value="PENDING">Pendente</option>
                    <option value="DONE">Resolvida</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Prioridade
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(event) =>
                      handleFilterChange("priority", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Todas</option>
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
                    value={filters.shift}
                    onChange={(event) =>
                      handleFilterChange("shift", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Todos</option>
                    {SHIFT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(event) =>
                      handleFilterChange("category", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Todas</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Limpar
                </button>

                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppLayout>
  );
}
