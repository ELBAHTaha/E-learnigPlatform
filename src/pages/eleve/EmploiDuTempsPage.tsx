import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeeklyCalendar } from "@/features/schedule/WeeklyCalendar";
import { roomsApi, scheduleApi, usersApi } from "@/api";
import { useAuth } from "@/store/auth";

export function EmploiDuTempsPage() {
  const user = useAuth((s) => s.user)!;
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", { eleveId: user.id }],
    queryFn: () => scheduleApi.listSessions({ eleveId: user.id }),
  });
  const { data: rooms } = useQuery({ queryKey: ["rooms"], queryFn: () => roomsApi.listRooms() });
  const { data: formateurs } = useQuery({
    queryKey: ["users", "formateur"],
    queryFn: () => usersApi.listFormateurs(),
  });

  return (
    <div>
      <PageHeader
        title="Emploi du temps"
        description="Visualisez vos sessions à venir, en présentiel ou en ligne."
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
          getFormateurName={(id) => {
            const f = formateurs?.find((u) => u.id === id);
            return f ? `${f.firstName} ${f.lastName}` : undefined;
          }}
        />
      )}
    </div>
  );
}
