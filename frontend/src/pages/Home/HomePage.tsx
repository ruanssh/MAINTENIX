import { useAuth } from "../../auth/AuthContext";

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">MAINTENIX</h1>
            <p className="mt-1 text-sm opacity-70">
              Signed in as {user?.name ?? "Unknown"} ({user?.email ?? ""})
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 hover:bg-black/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
