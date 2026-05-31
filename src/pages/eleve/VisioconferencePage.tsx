import { useQuery } from "@tanstack/react-query";
import { Video, ExternalLink, Calendar } from "lucide-react";
import { Button, Card, CardBody, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { scheduleApi } from "@/api";
import { useAuth } from "@/store/auth";
import { formatDateTime } from "@/lib/format";

export function VisioconferencePage() {
  const user = useAuth((s) => s.user)!;
  const { data: sessions } = useQuery({
    queryKey: ["sessions", { eleveId: user.id }],
    queryFn: () => scheduleApi.listSessions({ eleveId: user.id }),
  });

  const online = (sessions ?? [])
    .filter((s) => !!s.meetingUrl)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div>
      <PageHeader
        title="Visioconférence"
        description="Rejoignez vos sessions en ligne en un clic."
      />
      {online.length === 0 ? (
        <EmptyState
          icon={<Video className="h-6 w-6" />}
          title="Aucune visioconférence programmée"
          description="Les sessions en ligne apparaîtront ici dès qu'elles seront ajoutées."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {online.map((s) => {
            const start = new Date(s.start).getTime();
            const now = Date.now();
            const end = new Date(s.end).getTime();
            const isLive = now >= start && now <= end;
            const minsUntil = Math.round((start - now) / 60000);
            return (
              <Card key={s.id}>
                <CardBody>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-info/10 text-info inline-flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900">{s.title}</p>
                      <p className="mt-0.5 text-xs text-navy-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(s.start)}
                      </p>
                      <p className="mt-2 text-xs">
                        {isLive ? (
                          <span className="text-success font-medium">En direct</span>
                        ) : minsUntil > 0 && minsUntil < 60 ? (
                          <span className="text-warning font-medium">
                            Commence dans {minsUntil} min
                          </span>
                        ) : (
                          <span className="text-navy-500">À venir</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href={s.meetingUrl} target="_blank" rel="noreferrer">
                      <Button
                        fullWidth
                        variant={isLive ? "secondary" : "outline"}
                        rightIcon={<ExternalLink className="h-4 w-4" />}
                      >
                        {isLive ? "Rejoindre maintenant" : "Lien de session"}
                      </Button>
                    </a>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
