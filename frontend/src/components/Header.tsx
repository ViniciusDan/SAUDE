import { useAuth } from "../modules/auth/AuthContext";
import { formatCpf } from "../utils/formatters";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/Button";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-[#e5e7ef] z-30 dark:bg-[#0f1423] dark:border-[#1e2742]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[#1351B4] bg-[#e8f0ff] hover:bg-[#d9e6ff] border border-transparent dark:bg-[#1c2640] dark:text-white dark:border-[#2c3a5c] dark:hover:bg-[#273555] transition-colors shadow-sm"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex-1 lg:flex-none"></div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#1351B4] bg-[#e8f0ff] hover:bg-[#d9e6ff] border border-transparent dark:bg-[#1c2640] dark:text-white dark:border-[#2c3a5c] dark:hover:bg-[#273555] transition-colors shadow-sm"
            aria-label="Alternar tema"
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 px-2 lg:px-4 py-2 rounded-lg bg-[#f3f4fa] dark:bg-[#2a2a2a]">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#1351B4] flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
              {initials}
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-[#212529] dark:text-white">{user.name}</div>
              <div className="text-xs text-[#6c757d] dark:text-gray-400">CPF: {formatCpf(user.cpf)}</div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="p-2 lg:px-3 text-[#212529] bg-[#ffd800] hover:bg-[#ffe352] dark:text-white dark:bg-[#1c2640] dark:hover:bg-[#25345a]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden lg:inline ml-2">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}


