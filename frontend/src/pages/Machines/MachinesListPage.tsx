import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FiCpu,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiHash,
  FiLayers,
  FiFilter,
} from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { MachinesService } from "../../services/machines.service";
import { parseApiError } from "../../api/errors";
import type { Machine } from "../../types/machines";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function IconButton({
  title,
  variant = "default",
  onClick,
  children,
}: {
  title: string;
  variant?: "default" | "danger";
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-md border px-2 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300";
  const styles =
    variant === "danger"
      ? "border-red-200 text-red-600 hover:bg-red-50"
      : "border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}

export function MachinesListPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    line: "",
    location: "",
    model: "",
    serial: "",
    hasPhoto: "all",
  });

  async function loadMachines() {
    setLoading(true);
    try {
      const data = await MachinesService.list();
      setMachines(data);
      setPage(1);
    } catch (e) {
      toast.error(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(machine: Machine) {
    const ok = window.confirm(`Excluir máquina "${machine.name}"?`);
    if (!ok) return;

    try {
      await MachinesService.remove(machine.id);
      toast.success("Máquina excluída.");
      await loadMachines();
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  useEffect(() => {
    void loadMachines();
  }, []);

  const filteredMachines = useMemo(() => {
    const nameQuery = filters.name.trim().toLowerCase();
    const lineQuery = filters.line.trim().toLowerCase();
    const locationQuery = filters.location.trim().toLowerCase();
    const modelQuery = filters.model.trim().toLowerCase();
    const serialQuery = filters.serial.trim().toLowerCase();

    return machines.filter((machine) => {
      const matchesName = nameQuery
        ? machine.name.toLowerCase().includes(nameQuery)
        : true;
      const matchesLine = lineQuery
        ? (machine.line ?? "").toLowerCase().includes(lineQuery)
        : true;
      const matchesLocation = locationQuery
        ? (machine.location ?? "").toLowerCase().includes(locationQuery)
        : true;
      const matchesModel = modelQuery
        ? (machine.model ?? "").toLowerCase().includes(modelQuery)
        : true;
      const matchesSerial = serialQuery
        ? (machine.serial_number ?? "").toLowerCase().includes(serialQuery)
        : true;
      const matchesPhoto =
        filters.hasPhoto === "all"
          ? true
          : filters.hasPhoto === "yes"
            ? Boolean(machine.photo_url)
            : !machine.photo_url;

      return (
        matchesName &&
        matchesLine &&
        matchesLocation &&
        matchesModel &&
        matchesSerial &&
        matchesPhoto
      );
    });
  }, [machines, filters]);

  const totalItems = filteredMachines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);

  const pagedMachines = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredMachines.slice(start, start + perPage);
  }, [filteredMachines, currentPage, perPage]);

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

  function handleFilterChange(field: keyof typeof filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  }

  function handleClearFilters() {
    setFilters({
      name: "",
      line: "",
      location: "",
      model: "",
      serial: "",
      hasPhoto: "all",
    });
    setPage(1);
  }

  return (
    <AppLayout title="Máquinas">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Máquinas</h1>
            <p className="mt-1 text-sm text-slate-600">
              Gerencie o cadastro de máquinas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <FiFilter className="text-slate-600" />
              Filtros
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Itens por página</span>
              <select
                value={perPage}
                onChange={(event) => handlePerPageChange(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/machines/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <FiCpu />
              Nova máquina
            </Link>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="sticky top-0 bg-white py-3">
                  <span className="inline-flex items-center gap-2">
                    <FiCpu className="text-slate-400" />
                    Nome
                  </span>
                </th>
                <th className="sticky top-0 bg-white py-3">
                  <span className="inline-flex items-center gap-2">
                    <FiLayers className="text-slate-400" />
                    Linha
                  </span>
                </th>
                <th className="sticky top-0 bg-white py-3">
                  <span className="inline-flex items-center gap-2">
                    <FiMapPin className="text-slate-400" />
                    Local
                  </span>
                </th>
                <th className="sticky top-0 bg-white py-3">Modelo</th>
                <th className="sticky top-0 bg-white py-3">
                  <span className="inline-flex items-center gap-2">
                    <FiHash className="text-slate-400" />
                    Serial
                  </span>
                </th>
                <th className="sticky top-0 bg-white py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Carregando máquinas...
                  </td>
                </tr>
              )}

              {!loading && machines.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhuma máquina cadastrada.
                  </td>
                </tr>
              )}

              {!loading && machines.length > 0 && totalItems === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhuma máquina encontrada com os filtros atuais.
                  </td>
                </tr>
              )}

              {!loading &&
                pagedMachines.map((machine) => (
                  <tr
                    key={machine.id}
                    className="group border-b border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                          <FiCpu />
                        </span>
                        <span>{machine.name}</span>
                      </div>
                    </td>

                    <td className="py-4 text-slate-600">
                      {machine.line ? <Badge>{machine.line}</Badge> : "-"}
                    </td>

                    <td className="py-4 text-slate-600">
                      {machine.location ? (
                        <Badge>{machine.location}</Badge>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="py-4 text-slate-600">
                      <span className="font-mono text-xs">
                        {machine.model ?? "-"}
                      </span>
                    </td>

                    <td className="py-4 text-slate-600">
                      <span className="font-mono text-xs">
                        {machine.serial_number ?? "-"}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/machines/${machine.id}/edit`}
                          title="Editar"
                          aria-label="Editar"
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                          <FiEdit2 />
                        </Link>

                        <IconButton
                          title="Excluir"
                          variant="danger"
                          onClick={() => handleDelete(machine)}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>

              {pageButtons.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={[
                    "rounded-lg border px-3 py-1 text-sm font-medium",
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
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            <div className="flex h-[calc(100%-140px)] flex-col gap-4 overflow-y-auto px-6 py-4">
              <div>
                <label className="text-sm font-medium text-slate-800">
                  Nome
                </label>
                <input
                  value={filters.name}
                  onChange={(event) =>
                    handleFilterChange("name", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="Extrusora DS"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Linha
                </label>
                <input
                  value={filters.line}
                  onChange={(event) =>
                    handleFilterChange("line", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="Linha 3"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Local
                </label>
                <input
                  value={filters.location}
                  onChange={(event) =>
                    handleFilterChange("location", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="Setor B"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Modelo
                </label>
                <input
                  value={filters.model}
                  onChange={(event) =>
                    handleFilterChange("model", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="DS-3000"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Número de série
                </label>
                <input
                  value={filters.serial}
                  onChange={(event) =>
                    handleFilterChange("serial", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="SN-001-2025"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Foto
                </label>
                <select
                  value={filters.hasPhoto}
                  onChange={(event) =>
                    handleFilterChange("hasPhoto", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="all">Todas</option>
                  <option value="yes">Com foto</option>
                  <option value="no">Sem foto</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Limpar filtros
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
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
