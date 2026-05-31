import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Select,
  Table,
  toast,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { enrollmentsApi, formationsApi, usersApi } from "@/api";
import { formatDate } from "@/lib/format";
import type { Enrollment } from "@/types";

interface Row extends Enrollment {
  studentName: string;
  formationTitle: string;
}

export function InscriptionsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<Enrollment["status"] | "">("en-attente");

  const { data: enrollments } = useQuery({
    queryKey: ["enrollments", { status }],
    queryFn: () =>
      enrollmentsApi.listEnrollments(status ? { status: status as Enrollment["status"] } : {}),
  });
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });

  const rows: Row[] = useMemo(() => {
    return (enrollments ?? []).map((e) => {
      const u = eleves?.find((x) => x.id === e.eleveId);
      const f = formations?.find((x) => x.id === e.formationId);
      return {
        ...e,
        studentName: u ? `${u.firstName} ${u.lastName}` : e.eleveId,
        formationTitle: f?.title ?? e.formationId,
      };
    });
  }, [enrollments, eleves, formations]);

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approuvee" | "refusee" }) =>
      enrollmentsApi.decideEnrollment(id, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success(status === "approuvee" ? "Inscription approuvée" : "Inscription refusée");
    },
  });

  const columns: Column<Row>[] = [
    {
      key: "student",
      header: "Élève",
      cell: (r) => <span className="font-medium text-navy-900">{r.studentName}</span>,
      sortAccessor: (r) => r.studentName,
    },
    { key: "formation", header: "Formation", cell: (r) => r.formationTitle, sortAccessor: (r) => r.formationTitle },
    {
      key: "requested",
      header: "Demande",
      cell: (r) => formatDate(r.requestedAt),
      sortAccessor: (r) => new Date(r.requestedAt).getTime(),
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => {
        const tone =
          r.status === "approuvee"
            ? "success"
            : r.status === "refusee"
            ? "danger"
            : r.status === "terminee"
            ? "neutral"
            : "warning";
        const label =
          r.status === "approuvee"
            ? "Approuvée"
            : r.status === "refusee"
            ? "Refusée"
            : r.status === "terminee"
            ? "Terminée"
            : "En attente";
        return <Badge tone={tone as any} size="sm">{label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      cell: (r) =>
        r.status === "en-attente" ? (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => decide.mutate({ id: r.id, status: "approuvee" })}
              leftIcon={<Check className="h-4 w-4 text-success" />}
            >
              Approuver
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => decide.mutate({ id: r.id, status: "refusee" })}
              leftIcon={<X className="h-4 w-4 text-danger" />}
            >
              Refuser
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inscriptions"
        description="Approuvez ou refusez les demandes d'inscription."
      />
      <div className="mb-4 max-w-xs">
        <Select label="Filtrer par statut" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="">Toutes</option>
          <option value="en-attente">En attente</option>
          <option value="approuvee">Approuvées</option>
          <option value="refusee">Refusées</option>
          <option value="terminee">Terminées</option>
        </Select>
      </div>
      <Card>
        <CardHeader title={`${rows.length} demande(s)`} />
        <Table columns={columns} data={rows} rowKey={(r) => r.id} />
      </Card>
    </div>
  );
}
