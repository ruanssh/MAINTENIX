import { AppLayout } from "../../layouts/AppLayout";

export function HomePage() {
  return (
    <AppLayout title="Início">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Visão geral</h2>
        <p className="mt-2 text-sm text-slate-600">
          Próximas telas: Máquinas, Registros de manutenção, Galeria de fotos,
          Histórico.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Máquinas
            </div>
            <div className="mt-2 text-2xl font-semibold">0</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Registros pendentes
            </div>
            <div className="mt-2 text-2xl font-semibold">0</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Registros concluídos
            </div>
            <div className="mt-2 text-2xl font-semibold">0</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
