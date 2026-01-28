import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FiAlertCircle,
  FiFilter,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { MachinesService } from "../../services/machines.service";
import { MaintenanceRecordsService } from "../../services/maintenance-records.service";
import { parseApiError } from "../../api/errors";
import type { Machine } from "../../types/machines";
import type {
  MaintenanceRecord,
  MaintenanceRecordPriority,
  MaintenanceRecordStatus,
} from "../../types/maintenance-records";

type FiltersState = {
  query: string;
  status: "all" | MaintenanceRecordStatus;
  priority: "all" | MaintenanceRecordPriority;
};

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
      {status === "DONE" ? <FiCheckCircle /> : <FiClock />}
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

export function MachineRecordsListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    query: "",
    status: "all",
    priority: "all",
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [machineData, recordsData] = await Promise.all([
          MachinesService.findById(id),
          MaintenanceRecordsService.list(id),
        ]);
        setMachine(machineData);
        setRecords(recordsData);
        setPage(1);
      } catch (e) {
        toast.error(parseApiError(e));
        navigate("/machines", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id, navigate]);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.query,
      filters.status !== "all" ? "1" : "",
      filters.priority !== "all" ? "1" : "",
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

      return matchesQuery && matchesStatus && matchesPriority;
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
    setFilters({ query: "", status: "all", priority: "all" });
    setPage(1);
  }

  return (
    <AppLayout title="Pendências">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Pendências
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {machine ? machine.name : "Carregando máquina..."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/machines")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                <FiArrowLeft className="text-slate-600" />
                Voltar
              </button>
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

              <Link
                to={`/machines/${id}/maintenance-records/new`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <FiPlus />
                Nova pendência
              </Link>
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
                    Status: {filters.status === "PENDING" ? "Pendente" : "Resolvida"}
                  </span>
                )}
                {filters.priority !== "all" && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Prioridade: {filters.priority}
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

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Pendência</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Status</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Prioridade</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Criada em</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      Carregando pendências...
                    </td>
                  </tr>
                )}

                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      Nenhuma pendência cadastrada.
                    </td>
                  </tr>
                )}

                {!loading && records.length > 0 && totalItems === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
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
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                            <FiAlertCircle />
                          </span>
                          <div className="min-w-0">
                            <div className="line-clamp-2 font-semibold text-slate-900">
                              {record.problem_description}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Início: {formatDateTime(record.started_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={record.priority} />
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDateTime(record.created_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/machines/${id}/maintenance-records/${record.id}`}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {record.status === "DONE"
                            ? "Ver resolução"
                            : "Resolver"}
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
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
                <h2 className="text-base font-semibold text-slate-900">Filtros</h2>
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
