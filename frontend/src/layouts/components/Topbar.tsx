import { useAuth } from "../../auth/AuthContext";

type Props = {
  title?: string;
};

export function Topbar({ title }: Props) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="md:hidden text-lg font-semibold tracking-tight">
            MAINTENIX
          </div>

          {title ? (
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-slate-900">
                {title}
              </div>
              <div className="text-xs text-slate-500">Dashboard</div>
            </div>
          ) : (
            <div className="hidden md:block text-sm text-slate-500">
              Welcome back
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-slate-900">
              {user?.name ?? "User"}
            </span>
            <span className="text-xs text-slate-500">{user?.email ?? ""}</span>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
