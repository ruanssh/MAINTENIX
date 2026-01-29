import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FiFilter, FiPlus, FiUser } from "react-icons/fi";

import { AppLayout } from "../../layouts/AppLayout";
import { UsersService } from "../../services/users.service";
import { parseApiError } from "../../api/errors";
import type { User } from "../../types/users";

type FiltersState = {
  query: string;
  role: "all" | "1" | "2";
  active: "all" | "active" | "inactive";
};

const ROLE_LABELS = new Map([
  [1, "Administrador"],
  [2, "Usuário"],
]);

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

export function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    query: "",
    role: "all",
    active: "all",
  });

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const data = await UsersService.list();
        setUsers(data);
        setPage(1);
      } catch (e) {
        toast.error(parseApiError(e));
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, []);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.query,
      filters.role !== "all" ? "1" : "",
      filters.active !== "all" ? "1" : "",
    ].filter(Boolean).length;
  }, [filters]);

  const filteredUsers = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery = query
        ? user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        : true;

      const matchesRole =
        filters.role === "all" ? true : String(user.role) === filters.role;

      const matchesActive =
        filters.active === "all"
          ? true
          : filters.active === "active"
            ? user.active
            : !user.active;

      return matchesQuery && matchesRole && matchesActive;
    });
  }, [users, filters]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredUsers.slice(start, start + perPage);
  }, [filteredUsers, currentPage, perPage]);

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
    setFilters({ query: "", role: "all", active: "all" });
    setPage(1);
  }

  return (
    <AppLayout title="Usuários">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Usuários
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Gerencie os perfis e acessos.
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

              <Link
                to="/users/new"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <FiPlus />
                Novo usuário
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
                {filters.role !== "all" && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Perfil: {ROLE_LABELS.get(Number(filters.role))}
                  </span>
                )}
                {filters.active !== "all" && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Status: {filters.active === "active" ? "Ativo" : "Inativo"}
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
              Carregando usuários...
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Nenhum usuário cadastrado.
            </div>
          )}

          {!loading && users.length > 0 && totalItems === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Nenhum usuário encontrado com os filtros atuais.
            </div>
          )}

          {!loading &&
            pagedUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                        <FiUser />
                      </span>
                      <div>
                        <div className="truncate font-semibold text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Perfil: {ROLE_LABELS.get(user.role) ?? user.role}</span>
                      <span className="text-slate-300">•</span>
                      <span>
                        Status: {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Criado em: {formatDateTime(user.created_at)}
                    </div>
                  </div>

                  <Link
                    to={`/users/${user.id}/edit`}
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-separate border-spacing-0 text-left text-sm md:min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Usuário</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Perfil</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3">Status</th>
                  <th className="sticky top-0 bg-slate-50 px-4 py-3 hidden md:table-cell">
                    Criado em
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
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Carregando usuários...
                    </td>
                  </tr>
                )}

                {!loading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                )}

                {!loading && users.length > 0 && totalItems === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Nenhum usuário encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}

                {!loading &&
                  pagedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                            <FiUser />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900">
                              {user.name}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {ROLE_LABELS.get(user.role) ?? user.role}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            user.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {user.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 hidden md:table-cell">
                        {formatDateTime(user.created_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/users/${user.id}/edit`}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Editar
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
                    placeholder="Nome ou e-mail"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Perfil
                  </label>
                  <select
                    value={filters.role}
                    onChange={(event) =>
                      handleFilterChange("role", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Todos</option>
                    <option value="1">Administrador</option>
                    <option value="2">Usuário</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-800">
                    Status
                  </label>
                  <select
                    value={filters.active}
                    onChange={(event) =>
                      handleFilterChange("active", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
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
