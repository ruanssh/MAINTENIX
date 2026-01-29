import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

type Props = {
  children: ReactNode;
  title?: string;
};

export function AppLayout({ children, title }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              variant="mobile"
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={title} onToggleMenu={() => setIsSidebarOpen(true)} />

          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
