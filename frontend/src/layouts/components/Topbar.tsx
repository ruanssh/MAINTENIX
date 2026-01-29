import { useEffect, useState } from "react";
import { FiMenu, FiMoon, FiSun } from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import maintenixLogo from "../../assets/maintenix.svg";
import maintenixLogoDark from "../../assets/maintenix-dark.svg";

type Props = {
  title?: string;
  onToggleMenu?: () => void;
};

export function Topbar({ title, onToggleMenu }: Props) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  function handleToggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("theme", next);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={onToggleMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menu"
            >
              <FiMenu />
            </button>
            <div className="flex items-center">
              <img
                src={maintenixLogo}
                alt="MAINTENIX"
                className="logo-light h-12 w-auto"
              />
              <img
                src={maintenixLogoDark}
                alt="MAINTENIX"
                className="logo-dark h-12 w-auto"
              />
            </div>
          </div>

          {title ? (
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-slate-900">
                {title}
              </div>
              <div className="text-xs text-slate-500">Painel</div>
            </div>
          ) : (
            <div className="hidden md:block text-sm text-slate-500">
              Bem-vindo de volta
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-slate-900">
              {user?.name ?? "Usuário"}
            </span>
            <span className="text-xs text-slate-500">{user?.email ?? ""}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={
              theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
            }
            title={
              theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
            }
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
