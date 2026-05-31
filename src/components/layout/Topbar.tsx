import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Search, Settings, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { ROLE_LABELS } from "@/lib/constants";

interface TopbarProps {
  onMenu: () => void;
  title?: string;
}

export function Topbar({ onMenu, title }: TopbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-navy-100 flex items-center px-4 lg:px-6 gap-3">
      <button
        type="button"
        onClick={onMenu}
        className="lg:hidden rounded-lg p-2 text-navy-700 hover:bg-navy-100"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {title && <h1 className="text-base font-semibold text-navy-900 hidden sm:block">{title}</h1>}
      <div className="hidden md:flex flex-1 max-w-md relative ml-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
        <input
          type="search"
          placeholder="Rechercher..."
          className="w-full h-10 rounded-lg border border-navy-200 bg-navy-50/40 pl-10 pr-3 text-sm placeholder:text-navy-400 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>
      <div className="flex-1 md:hidden" />
      <button
        type="button"
        className="relative rounded-lg p-2 text-navy-700 hover:bg-navy-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-navy-100"
        >
          <Avatar
            name={user ? `${user.firstName} ${user.lastName}` : "?"}
            size="sm"
          />
          <span className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-navy-900">
              {user ? `${user.firstName} ${user.lastName}` : "Invité"}
            </span>
            <span className="text-[10px] text-navy-500">
              {user ? ROLE_LABELS[user.role] : ""}
            </span>
          </span>
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-navy-100 shadow-elevated z-20 py-1 animate-fade-in">
              <Link
                to="/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50"
              >
                <UserIcon className="h-4 w-4" />
                Mon profil
              </Link>
              <Link
                to="/profil/parametres"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50"
              >
                <Settings className="h-4 w-4" />
                Paramètres
              </Link>
              <div className="my-1 border-t border-navy-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
