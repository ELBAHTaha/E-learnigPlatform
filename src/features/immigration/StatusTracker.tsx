import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  IMMIGRATION_STATUS_LABELS,
} from "@/lib/constants";
import type { ImmigrationStatus } from "@/types";

const ORDER: ImmigrationStatus[] = [
  "nouveau",
  "en-cours",
  "documents-requis",
  "soumis",
  "finalise",
];

export function StatusTracker({ current }: { current: ImmigrationStatus }) {
  const idx = ORDER.indexOf(current);
  return (
    <ol className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
      {ORDER.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex items-center gap-2 sm:flex-1 sm:flex-col sm:text-center">
            <div className="flex items-center gap-2 sm:gap-0 sm:flex-col">
              <span
                className={cn(
                  "h-8 w-8 rounded-full inline-flex items-center justify-center text-xs font-semibold shrink-0",
                  done && "bg-success text-white",
                  active && "bg-accent text-white ring-4 ring-accent/20",
                  !done && !active && "bg-navy-100 text-navy-500"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs sm:mt-2",
                  active && "font-semibold text-navy-900",
                  done && "text-success",
                  !done && !active && "text-navy-500"
                )}
              >
                {IMMIGRATION_STATUS_LABELS[s]}
              </span>
            </div>
            {i < ORDER.length - 1 && (
              <span
                className={cn(
                  "hidden sm:block flex-1 h-0.5 mx-1",
                  done ? "bg-success" : "bg-navy-100"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
