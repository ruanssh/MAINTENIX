import { Link } from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout";

export function AccessDeniedPage() {
  return (
    <AppLayout title="Acesso negado">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">:(</div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Você não tem acesso
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Somente administradores podem acessar esta área.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Voltar ao início
            </Link>
            <Link
              to="/inbox"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ir para minhas pendências
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
