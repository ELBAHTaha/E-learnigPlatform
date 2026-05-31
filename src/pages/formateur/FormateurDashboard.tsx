import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Calendar, Users } from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/store/auth";
import { enrollmentsApi, formationsApi, scheduleApi } from "@/api";
import { formatDateTime } from "@/lib/format";
import { POLE_LABELS } from "@/lib/constants";

export function FormateurDashboard() {
  const user = useAuth((s) => s.user)!;
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: sessions } = useQuery({
    queryKey: ["sessions", { formateurId: user.id }],
    queryFn: () => scheduleApi.listSessions({ formateurId: user.id }),
  });
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentsApi.listEnrollments({}),
  });

  const myFormations = (formations ?? []).filter((f) => f.formateurId === user.id);
  const studentsCount = new Set(
    (enrollments ?? [])
      .filter(
        (e) =>
          myFormations.some((f) => f.id === e.formationId) &&
          e.status === "approuvee"
      )
      .map((e) => e.eleveId)
  ).size;

  const upcoming = (sessions ?? [])
    .filter((s) => new Date(s.start).getTime() > Date.now())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Bonjour ${user.firstName}`}
        description="Vue d'ensemble de vos cours et de vos élèves."
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-navy-500">Cours actifs</p>
              <p className="text-2xl font-display font-semibold text-navy-900">
                {myFormations.length}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent inline-flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-navy-500">Sessions à venir</p>
              <p className="text-2xl font-display font-semibold text-navy-900">
                {upcoming.length}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 text-green-700 inline-flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-navy-500">Élèves suivis</p>
              <p className="text-2xl font-display font-semibold text-navy-900">
                {studentsCount}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Mes cours"
            action={
              <Link
                to="/formateur/cours"
                className="text-xs text-accent font-medium inline-flex items-center gap-1"
              >
                Gérer <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-navy-100">
              {myFormations.map((f) => (
                <li key={f.id} className="p-4 flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center text-white font-semibold"
                    style={{ background: f.imageColor ?? "#1B2A4A" }}
                  >
                    {f.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{f.title}</p>
                    <p className="text-xs text-navy-500">
                      {POLE_LABELS[f.pole]} · {f.enrolled} élèves
                    </p>
                  </div>
                  <Badge tone="primary" size="sm">{f.level}</Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Prochaines sessions"
            action={
              <Link
                to="/formateur/emploi-du-temps"
                className="text-xs text-accent font-medium inline-flex items-center gap-1"
              >
                Emploi du temps <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <CardBody className="p-0">
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
                  {s.meetingUrl && <Badge tone="info" size="sm">En ligne</Badge>}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
