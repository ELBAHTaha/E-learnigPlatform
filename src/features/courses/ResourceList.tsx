import { Download, FileText, PlayCircle, FileCheck2, BookOpen } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { formatRelative } from "@/lib/format";
import type { CourseResource, ResourceType } from "@/types";

const labels: Record<ResourceType, { label: string; icon: typeof FileText; tone: "primary" | "accent" | "success" | "info" }> = {
  cours: { label: "Cours", icon: BookOpen, tone: "primary" },
  exercice: { label: "Exercice", icon: FileText, tone: "accent" },
  corrige: { label: "Corrigé", icon: FileCheck2, tone: "success" },
  video: { label: "Vidéo", icon: PlayCircle, tone: "info" },
};

export function ResourceList({
  resources,
  onDelete,
}: {
  resources: CourseResource[];
  onDelete?: (id: string) => void;
}) {
  if (resources.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="Aucune ressource"
        description="Les supports de cours, exercices et corrigés apparaîtront ici."
      />
    );
  }
  return (
    <ul className="divide-y divide-navy-100">
      {resources.map((r) => {
        const meta = labels[r.type];
        const Icon = meta.icon;
        return (
          <li key={r.id} className="flex items-center gap-3 py-3">
            <div className="h-10 w-10 rounded-lg bg-navy-50 inline-flex items-center justify-center text-navy-700 shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-900 truncate">{r.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-navy-500">
                <Badge tone={meta.tone} size="sm">
                  {meta.label}
                </Badge>
                {r.size && <span>{r.size}</span>}
                <span>· {formatRelative(r.uploadedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={r.url ?? "#"}
                onClick={(e) => !r.url && e.preventDefault()}
                className="rounded-lg p-2 text-navy-700 hover:bg-navy-100"
                title="Télécharger"
              >
                <Download className="h-4 w-4" />
              </a>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="rounded-lg px-2 py-1 text-xs text-danger hover:bg-red-50"
                >
                  Supprimer
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
