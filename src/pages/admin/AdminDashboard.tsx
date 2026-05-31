import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BookOpen, Megaphone, School, UserCog, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  announcementsApi,
  enrollmentsApi,
  formationsApi,
  usersApi,
} from "@/api";
import { POLES, POLE_LABELS } from "@/lib/constants";
import { AnnouncementFeed } from "@/features/announcements/AnnouncementFeed";

const POLE_COLORS = ["#1B2A4A", "#2E4373", "#E8954A", "#C9762F"];

export function AdminDashboard() {
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });
  const { data: formateurs } = useQuery({
    queryKey: ["users", "formateur"],
    queryFn: () => usersApi.listFormateurs(),
  });
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentsApi.listEnrollments({}),
  });
  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementsApi.listAnnouncements(),
  });

  const now = new Date();
  const thisMonth = (enrollments ?? []).filter((e) => {
    const d = new Date(e.requestedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const byPole = POLES.map((p, i) => ({
    name: p.label,
    elèves: (eleves ?? []).filter((e) => (e as any).interestedPole === p.id).length,
    formations: (formations ?? []).filter((f) => f.pole === p.id).length,
    color: POLE_COLORS[i],
  }));

  const enrollmentsByMonth = (() => {
    const map = new Map<string, number>();
    (enrollments ?? []).forEach((e) => {
      const d = new Date(e.requestedAt);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort()
      .slice(-6)
      .map(([k, v]) => ({ month: k.slice(5), inscriptions: v }));
  })();

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'académie."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          {
            icon: Users,
            label: "Total élèves",
            value: (eleves ?? []).length,
            tone: "bg-primary/10 text-primary",
          },
          {
            icon: UserCog,
            label: "Formateurs",
            value: (formateurs ?? []).length,
            tone: "bg-accent/10 text-accent",
          },
          {
            icon: School,
            label: "Formations actives",
            value: (formations ?? []).length,
            tone: "bg-green-100 text-green-700",
          },
          {
            icon: BookOpen,
            label: "Inscriptions ce mois",
            value: thisMonth.length,
            tone: "bg-blue-100 text-blue-700",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${s.tone}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-navy-500">{s.label}</p>
                <p className="text-2xl font-display font-semibold text-navy-900">{s.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Inscriptions par mois" description="6 derniers mois" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentsByMonth}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                  <Bar dataKey="inscriptions" fill="#E8954A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Élèves par pôle" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="elèves"
                    data={byPole}
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                  >
                    {byPole.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Formations par pôle" />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {POLES.map((p, i) => (
                <div key={p.id} className="rounded-xl border border-navy-100 p-4">
                  <div
                    className="h-2 w-12 rounded-full mb-3"
                    style={{ background: POLE_COLORS[i] }}
                  />
                  <p className="text-xs text-navy-500">{POLE_LABELS[p.id]}</p>
                  <p className="mt-1 text-2xl font-display font-semibold text-navy-900">
                    {(formations ?? []).filter((f) => f.pole === p.id).length}
                  </p>
                  <p className="text-xs text-navy-500">
                    {(formations ?? [])
                      .filter((f) => f.pole === p.id)
                      .reduce((a, f) => a + f.enrolled, 0)}{" "}
                    inscrits
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Annonces récentes"
            action={<Megaphone className="h-5 w-5 text-accent" />}
          />
          <CardBody>
            <AnnouncementFeed items={(announcements ?? []).slice(0, 3)} compact />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
