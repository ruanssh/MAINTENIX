import { NavLink } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import maintenixLogo from "../../assets/maintenix.svg";
import maintenixLogoDark from "../../assets/maintenix-dark.svg";

type SidebarProps = {
  variant?: "desktop" | "mobile";
  onClose?: () => void;
};

function linkClassName(isActive: boolean) {
  return [
    "sidebar-link flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "sidebar-link-active bg-slate-900 text-white"
      : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

export function Sidebar({ variant = "desktop", onClose }: SidebarProps) {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 1;
  const isMobile = variant === "mobile";

  function handleNavigate() {
    if (isMobile) onClose?.();
  }

  return (
    <aside
      className={
        isMobile
          ? "flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white"
          : "hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col"
      }
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center">
          <img
            src={maintenixLogo}
            alt="MAINTENIX"
            className="logo-light h-16 w-auto block translate-y-[1px]"
          />
          <img
            src={maintenixLogoDark}
            alt="MAINTENIX"
            className="logo-dark h-16 w-auto block translate-y-[1px]"
          />
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
            aria-label="Fechar menu"
          >
            <FiX />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Menu
        </div>

        <NavLink
          to="/"
          className={({ isActive }) => linkClassName(isActive)}
          end
          onClick={handleNavigate}
        >
          Início
        </NavLink>

        <NavLink
          to="/inbox"
          className={({ isActive }) => linkClassName(isActive)}
          onClick={handleNavigate}
        >
          Minhas pendências
        </NavLink>
        <NavLink
          to="/maintenance-records"
          className={({ isActive }) => linkClassName(isActive)}
          onClick={handleNavigate}
        >
          Pendências gerais
        </NavLink>
        {!loading && isAdmin && (
          <>
            <NavLink
              to="/machines"
              className={({ isActive }) => linkClassName(isActive)}
              onClick={handleNavigate}
            >
              Máquinas
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) => linkClassName(isActive)}
              onClick={handleNavigate}
            >
              Usuários
            </NavLink>
          </>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
        v0.1
      </div>
    </aside>
  );
}
