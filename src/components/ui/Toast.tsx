import { create } from "zustand";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) }));
    }, 4500);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().push({ tone: "success", title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().push({ tone: "error", title, message }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().push({ tone: "warning", title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().push({ tone: "info", title, message }),
};

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-danger" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-info" />,
};

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border bg-white p-4 shadow-elevated animate-slide-up",
            "border-navy-100"
          )}
        >
          <span className="shrink-0">{icons[t.tone]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-navy-900">{t.title}</p>
            {t.message && <p className="mt-0.5 text-xs text-navy-500">{t.message}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="text-navy-400 hover:text-navy-700"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
