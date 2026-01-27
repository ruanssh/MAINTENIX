import { NavLink } from "react-router-dom";

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="px-4 py-4 border-b border-slate-200">
        <div className="text-lg font-semibold tracking-tight">MAINTENIX</div>
        <div className="text-xs text-slate-500">MVP</div>
      </div>

      <nav className="flex-1 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Menu
        </div>

        <NavLink to="/" className={linkClassName} end>
          Home
        </NavLink>
      </nav>

      <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
        v0.1
      </div>
    </aside>
  );
}
