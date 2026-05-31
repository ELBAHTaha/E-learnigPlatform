import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  onNavigate?: () => void;
  compact?: boolean;
}

export function Sidebar({ items, onNavigate, compact }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-navy-900 text-navy-100",
        compact ? "w-full" : "w-64"
      )}
    >
      <div className="h-16 px-4 flex items-center border-b border-white/10">
        <Logo variant="light" size="sm" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "text-navy-200 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-3 text-xs text-navy-400">
        <p>AFG Academy</p>
        <p className="text-navy-500">v0.1.0 · démo</p>
      </div>
    </aside>
  );
}
