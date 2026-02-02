import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "../../layouts/AppLayout";
import { DashboardService } from "../../services/dashboard.service";
import { parseApiError } from "../../api/errors";
import type { DashboardSummary } from "../../types/dashboard";
import type { MaintenanceRecordShift } from "../../types/maintenance-records";

const SHIFT_OPTIONS: Array<{ value: MaintenanceRecordShift | "all"; label: string }> = [
  { value: "all", label: "Todos os turnos" },
  { value: "PRIMEIRO", label: "Primeiro turno" },
  { value: "SEGUNDO", label: "Segundo turno" },
  { value: "TERCEIRO", label: "Terceiro turno" },
];

export function HomePage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState<MaintenanceRecordShift | "all">("all");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setLoading(true);
      try {
        const data = await DashboardService.getSummary(
          shift === "all" ? undefined : shift,
        );
        if (active) setSummary(data);
      } catch (error) {
        toast.error(parseApiError(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, [shift]);

  const completionRate = useMemo(() => {
    if (!summary) return 0;
    const total = summary.totals.pending + summary.totals.done;
    if (total === 0) return 0;
    return Math.round((summary.totals.done / total) * 100);
  }, [summary]);

  return (
    <AppLayout title="Início">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Dashboard de manutenção
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Indicadores rápidos para acompanhar as pendências.
              </p>
            </div>
            <div className="w-full md:w-64">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Turno
              </label>
              <select
                value={shift}
                onChange={(event) =>
                  setShift(event.target.value as MaintenanceRecordShift | "all")
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {SHIFT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs font-semibold uppercase text-emerald-700">
                Pendências abertas
              </div>
              <div className="mt-2 text-3xl font-semibold text-emerald-900">
                {loading ? "..." : summary?.totals.pending ?? 0}
              </div>
              <div className="mt-1 text-xs text-emerald-700">
                Filtrado por turno
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-semibold uppercase text-amber-700">
                Registros concluídos
              </div>
              <div className="mt-2 text-3xl font-semibold text-amber-900">
                {loading ? "..." : summary?.totals.done ?? 0}
              </div>
              <div className="mt-1 text-xs text-amber-700">
                Filtrado por turno
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Concluídas x abertas
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {loading ? "..." : `${completionRate}%`}
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Pendências abertas por turno
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {summary ? (
                [
                  { label: "Primeiro", value: summary.pendingByShift.PRIMEIRO },
                  { label: "Segundo", value: summary.pendingByShift.SEGUNDO },
                  { label: "Terceiro", value: summary.pendingByShift.TERCEIRO },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      {item.label} turno
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {loading ? "..." : item.value}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">
                  {loading ? "Carregando dados..." : "Sem dados disponíveis."}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Top 5 máquinas com pendências abertas
            </h3>
            <div className="mt-4 space-y-3">
              {loading && (
                <div className="text-sm text-slate-500">Carregando...</div>
              )}
              {!loading && summary?.topMachinesPending.length === 0 && (
                <div className="text-sm text-slate-500">
                  Nenhuma pendência em aberto.
                </div>
              )}
              {!loading &&
                summary?.topMachinesPending.map((machine, index) => (
                  <div
                    key={machine.machine_id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase text-slate-500">
                        #{index + 1}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {machine.name}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {machine.pending}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
