import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  Select,
  Table,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { enrollmentsApi, formationsApi, usersApi } from "@/api";
import { useAuth } from "@/store/auth";
import { formatDate } from "@/lib/format";

interface Row {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  progress: number;
  startedAt?: string;
}

export function MesElevesPage() {
  const user = useAuth((s) => s.user)!;
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentsApi.listEnrollments({}),
  });
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });

  const mine = (formations ?? []).filter((f) => f.formateurId === user.id);
  const [formationId, setFormationId] = useState<string>("");
  const currentId = formationId || mine[0]?.id || "";

  const rows: Row[] = useMemo(() => {
    return (enrollments ?? [])
      .filter((e) => e.formationId === currentId && e.status === "approuvee")
      .map((e) => {
        const u = eleves?.find((x) => x.id === e.eleveId);
        return {
          id: e.id,
          name: u ? `${u.firstName} ${u.lastName}` : e.eleveId,
          email: u?.email ?? "",
          phone: u?.phone,
          city: u?.city,
          progress: e.progress,
          startedAt: e.decidedAt,
        };
      });
  }, [enrollments, eleves, currentId]);

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Élève",
      cell: (r) => (
        <div>
          <p className="font-medium text-navy-900">{r.name}</p>
          <p className="text-xs text-navy-500">{r.email}</p>
        </div>
      ),
      sortAccessor: (r) => r.name,
    },
    { key: "phone", header: "Téléphone", cell: (r) => r.phone ?? "—" },
    { key: "city", header: "Ville", cell: (r) => r.city ?? "—" },
    {
      key: "progress",
      header: "Progression",
      cell: (r) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${r.progress}%` }} />
          </div>
          <span className="text-xs font-semibold">{r.progress}%</span>
        </div>
      ),
      sortAccessor: (r) => r.progress,
    },
    {
      key: "startedAt",
      header: "Inscrit le",
      cell: (r) => (r.startedAt ? formatDate(r.startedAt) : "—"),
      sortAccessor: (r) => (r.startedAt ? new Date(r.startedAt).getTime() : 0),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mes élèves"
        description="Roster détaillé par formation."
      />
      <div className="mb-4 max-w-sm">
        <Select
          label="Formation"
          value={currentId}
          onChange={(e) => setFormationId(e.target.value)}
        >
          {mine.length === 0 ? (
            <option value="">Aucune formation</option>
          ) : (
            mine.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))
          )}
        </Select>
      </div>
      <Card>
        <CardHeader title={`${rows.length} élève(s)`} />
        <Table columns={columns} data={rows} rowKey={(r) => r.id} />
      </Card>
    </div>
  );
}
