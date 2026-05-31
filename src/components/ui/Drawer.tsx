import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  children: ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-navy-900/50" onClick={onClose} />
      <aside
        className={cn(
          "absolute top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-elevated flex flex-col",
          side === "right" ? "right-0" : "left-0",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
            <h3 className="text-base font-semibold text-navy-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
