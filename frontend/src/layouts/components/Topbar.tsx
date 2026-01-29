import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiLogOut, FiMenu, FiMoon, FiSun } from "react-icons/fi";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-2 md:h-14 md:flex-nowrap md:px-6 md:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => onToggleMenu?.()}
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

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={
              theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
            }
            title={
              theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-900 hover:bg-slate-50 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <span className="max-w-[140px] truncate">
                {user?.name ?? "Usuário"}
              </span>
              <FiChevronDown className="text-slate-500" />
            </button>

            {isMenuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="px-4 py-3 text-xs text-slate-500">
                    {user?.email ?? ""}
                  </div>
                  <div className="border-t border-slate-200">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Meu perfil
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <FiLogOut className="text-slate-500" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
