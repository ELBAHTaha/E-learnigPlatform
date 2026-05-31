import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";
import { useAuth } from "@/store/auth";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/formations", label: "Formations" },
  { to: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo size="sm" />
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-navy-600 hover:text-primary hover:bg-navy-50"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link to={`/${user.role === "eleve" ? "eleve" : user.role}`}>
              <Button size="sm">Mon espace</Button>
            </Link>
          ) : (
            <>
              <Link to="/connexion">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link to="/inscription">
                <Button variant="secondary" size="sm">S'inscrire</Button>
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden rounded-lg p-2 text-navy-700 hover:bg-navy-100"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-navy-100 bg-white animate-fade-in">
          <div className="container-page py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-lg text-sm font-medium",
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-navy-700 hover:bg-navy-50"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <Link to={`/${user.role === "eleve" ? "eleve" : user.role}`} className="col-span-2">
                  <Button fullWidth>Mon espace</Button>
                </Link>
              ) : (
                <>
                  <Link to="/connexion">
                    <Button variant="outline" fullWidth>Connexion</Button>
                  </Link>
                  <Link to="/inscription">
                    <Button variant="secondary" fullWidth>S'inscrire</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
