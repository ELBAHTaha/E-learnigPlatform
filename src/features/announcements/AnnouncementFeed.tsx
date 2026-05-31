import { Megaphone, Pin } from "lucide-react";
import { Badge, Card, CardBody, EmptyState } from "@/components/ui";
import { formatRelative } from "@/lib/format";
import type { Announcement } from "@/types";

export function AnnouncementFeed({
  items,
  compact = false,
}: {
  items: Announcement[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone className="h-6 w-6" />}
        title="Aucune annonce"
        description="Les nouvelles annonces apparaîtront ici."
      />
    );
  }
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <Card key={a.id} className={a.pinned ? "border-accent/40 bg-accent/5" : ""}>
          <CardBody className={compact ? "p-4" : ""}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {a.pinned && (
                    <Badge tone="accent" size="sm">
                      <Pin className="h-3 w-3" />
                      Épinglé
                    </Badge>
                  )}
                  <h3 className="font-semibold text-navy-900">{a.title}</h3>
                </div>
                <p className={`mt-2 text-sm text-navy-700 ${compact ? "line-clamp-2" : ""}`}>
                  {a.body}
                </p>
                <p className="mt-3 text-xs text-navy-500">
                  {a.author} · {formatRelative(a.publishedAt)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
