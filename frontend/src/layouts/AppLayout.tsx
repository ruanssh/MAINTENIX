import type { ReactNode } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

type Props = {
  children: ReactNode;
  title?: string;
};

export function AppLayout({ children, title }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={title} />

          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
