import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Video } from "lucide-react";
import { Badge, Button, Card, CardBody, Modal, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeeklyCalendar } from "@/features/schedule/WeeklyCalendar";
import { roomsApi, scheduleApi, formationsApi } from "@/api";
import { useAuth } from "@/store/auth";
import { formatDateTime } from "@/lib/format";
import type { ScheduleSession } from "@/types";

export function FormateurEmploiPage() {
  const user = useAuth((s) => s.user)!;
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", { formateurId: user.id }],
    queryFn: () => scheduleApi.listSessions({ formateurId: user.id }),
  });
  const { data: rooms } = useQuery({ queryKey: ["rooms"], queryFn: () => roomsApi.listRooms() });
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });

  const [selected, setSelected] = useState<ScheduleSession | null>(null);

  return (
    <div>
      <PageHeader
        title="Mon emploi du temps"
        description="Visualisez vos cours et démarrez vos visioconférences."
      />
      {isLoading ? (
        <Card>
          <CardBody>
            <Skeleton className="h-64 w-full" />
          </CardBody>
        </Card>
      ) : (
        <WeeklyCalendar
          sessions={sessions ?? []}
          getRoomName={(id) => rooms?.find((r) => r.id === id)?.name}
          onSessionClick={(s) => setSelected(s)}
        />
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        description={selected ? formatDateTime(selected.start) : ""}
        footer={
          selected?.meetingUrl ? (
            <a href={selected.meetingUrl} target="_blank" rel="noreferrer">
              <Button
                variant="secondary"
                rightIcon={<ExternalLink className="h-4 w-4" />}
              >
                Lancer la visioconférence
              </Button>
            </a>
          ) : (
            <Button variant="ghost" onClick={() => setSelected(null)}>Fermer</Button>
          )
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone="primary" size="sm">
                {formations?.find((f) => f.id === selected.formationId)?.title ??
                  "Formation"}
              </Badge>
              {selected.meetingUrl && (
                <Badge tone="info" size="sm">
                  <Video className="h-3 w-3" />
                  En ligne
                </Badge>
              )}
            </div>
            <p>
              <span className="text-navy-500">Début : </span>
              {formatDateTime(selected.start)}
            </p>
            <p>
              <span className="text-navy-500">Fin : </span>
              {formatDateTime(selected.end)}
            </p>
            <p>
              <span className="text-navy-500">Salle : </span>
              {rooms?.find((r) => r.id === selected.roomId)?.name ?? "—"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
