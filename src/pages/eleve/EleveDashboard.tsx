import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  announcementsApi,
  enrollmentsApi,
  formationsApi,
  gradesApi,
  scheduleApi,
} from "@/api";
import { useAuth } from "@/store/auth";
import { formatDateTime, formatPrice } from "@/lib/format";
import { POLE_LABELS } from "@/lib/constants";
import { AnnouncementFeed } from "@/features/announcements/AnnouncementFeed";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "accent" | "success" | "info";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-green-100 text-green-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <Card>
      <CardBody className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-navy-500">{label}</p>
          <p className="mt-1 text-2xl font-display font-semibold text-navy-900">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-navy-500">{hint}</p>}
        </div>
      </CardBody>
    </Card>
  );
}

export function EleveDashboard() {
  const user = useAuth((s) => s.user)!;

  const { data: enrollments, isLoading: lEnroll } = useQuery({
    queryKey: ["enrollments", { eleveId: user.id }],
    queryFn: () => enrollmentsApi.listEnrollments({ eleveId: user.id }),
  });
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: sessions } = useQuery({
    queryKey: ["sessions", { eleveId: user.id }],
    queryFn: () => scheduleApi.listSessions({ eleveId: user.id }),
  });
  const { data: grades } = useQuery({
    queryKey: ["grades", { eleveId: user.id }],
    queryFn: () => gradesApi.listGrades({ eleveId: user.id }),
  });
  const { data: announcements } = useQuery({
    queryKey: ["announcements", "eleve"],
    queryFn: () => announcementsApi.listAnnouncements("eleve"),
  });

  const approved = (enrollments ?? []).filter((e) => e.status === "approuvee");
  const upcoming = (sessions ?? [])
    .filter((s) => new Date(s.start).getTime() > Date.now())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 4);

  const avgScore =
    grades && grades.length > 0
      ? grades.reduce((acc, g) => acc + (g.score / g.outOf) * 20, 0) / grades.length
      : 0;

  return (
    <div>
      <PageHeader
        title={`Bonjour ${user.firstName} 👋`}
        description="Voici un aperçu de votre parcours cette semaine."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          icon={BookOpen}
          label="Formations actives"
          value={approved.length}
          tone="primary"
        />
        <StatCard
          icon={Calendar}
          label="Prochaines sessions"
          value={upcoming.length}
          tone="accent"
        />
        <StatCard
          icon={GraduationCap}
          label="Moyenne /20"
          value={avgScore.toFixed(1)}
          hint={`${grades?.length ?? 0} évaluation(s)`}
          tone="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Progression"
          value={`${Math.round(
            approved.reduce((a, e) => a + e.progress, 0) /
              Math.max(1, approved.length)
          )}%`}
          tone="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Mes formations en cours"
              action={
                <Link
                  to="/eleve/formations"
                  className="text-xs text-accent font-medium inline-flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <CardBody className="p-0">
              {lEnroll ? (
                <div className="p-6 space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : approved.length === 0 ? (
                <div className="p-6 text-sm text-navy-500">
                  Vous n'êtes inscrit à aucune formation pour l'instant.{" "}
                  <Link to="/formations" className="text-accent font-medium">
                    Explorez le catalogue
                  </Link>
                  .
                </div>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {approved.map((e) => {
                    const f = formations?.find((x) => x.id === e.formationId);
                    if (!f) return null;
                    return (
                      <li key={e.id} className="p-4 flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center text-white font-semibold"
                          style={{ background: f.imageColor ?? "#1B2A4A" }}
                        >
                          {f.title[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-900 truncate">{f.title}</p>
                          <p className="text-xs text-navy-500">
                            {POLE_LABELS[f.pole]} · {formatPrice(f.price)}
                          </p>
                          <div className="mt-2 h-1.5 w-full bg-navy-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${e.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-navy-700">
                          {e.progress}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Prochaines sessions"
              action={
                <Link
                  to="/eleve/emploi-du-temps"
                  className="text-xs text-accent font-medium inline-flex items-center gap-1"
                >
                  Emploi du temps <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <CardBody className="p-0">
              {upcoming.length === 0 ? (
                <div className="p-6 text-sm text-navy-500">
                  Aucune session à venir cette semaine.
                </div>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {upcoming.map((s) => (
                    <li key={s.id} className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent inline-flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {s.title}
                        </p>
                        <p className="text-xs text-navy-500">{formatDateTime(s.start)}</p>
                      </div>
                      {s.meetingUrl && (
                        <Badge tone="info" size="sm">En ligne</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Annonces"
              action={
                <Link
                  to="/eleve/annonces"
                  className="text-xs text-accent font-medium inline-flex items-center gap-1"
                >
                  Tout voir <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <CardBody>
              <AnnouncementFeed items={(announcements ?? []).slice(0, 3)} compact />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
