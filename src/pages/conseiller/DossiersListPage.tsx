import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  CardHeader,
  Select,
  Table,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { immigrationApi, usersApi } from "@/api";
import { useAuth } from "@/store/auth";
import { formatDate, formatRelative } from "@/lib/format";
import { IMMIGRATION_STATUS_LABELS, IMMIGRATION_STATUS_TONES } from "@/lib/constants";
import type { ImmigrationDossier, ImmigrationStatus } from "@/types";

interface Row extends ImmigrationDossier {
  studentName: string;
  studentEmail: string;
}

export function DossiersListPage() {
  const user = useAuth((s) => s.user)!;
  const [status, setStatus] = useState<ImmigrationStatus | "">("");

  const { data: dossiers } = useQuery({
    queryKey: ["dossiers", { conseillerId: user.id, status }],
    queryFn: () =>
      immigrationApi.listDossiers({
        conseillerId: user.id,
        ...(status ? { status: status as ImmigrationStatus } : {}),
      }),
  });
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });

  const rows: Row[] = (dossiers ?? []).map((d) => {
    const e = eleves?.find((x) => x.id === d.eleveId);
    return {
      ...d,
      studentName: e ? `${e.firstName} ${e.lastName}` : d.eleveId,
      studentEmail: e?.email ?? "",
    };
  });

  const columns: Column<Row>[] = [
    {
      key: "student",
      header: "Élève",
      cell: (r) => (
        <div>
          <p className="font-medium text-navy-900">{r.studentName}</p>
          <p className="text-xs text-navy-500">{r.studentEmail}</p>
        </div>
      ),
      sortAccessor: (r) => r.studentName,
    },
    {
      key: "destination",
      header: "Destination",
      cell: (r) => (
        <div>
          <p className="text-navy-900">{r.destination}</p>
          <p className="text-xs text-navy-500">{r.programType}</p>
        </div>
      ),
      sortAccessor: (r) => r.destination,
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => (
        <Badge tone={IMMIGRATION_STATUS_TONES[r.status] as any} size="sm">
          {IMMIGRATION_STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
    {
      key: "openedAt",
      header: "Ouvert le",
      cell: (r) => formatDate(r.openedAt),
      sortAccessor: (r) => new Date(r.openedAt).getTime(),
    },
    {
      key: "updatedAt",
      header: "Mise à jour",
      cell: (r) => formatRelative(r.updatedAt),
      sortAccessor: (r) => new Date(r.updatedAt).getTime(),
    },
    {
      key: "open",
      header: "",
      cell: (r) => (
        <Link
          to={`/conseiller/dossiers/${r.id}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          Ouvrir
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dossiers immigration"
        description="Tous les dossiers que vous suivez."
      />
      <div className="mb-4 max-w-xs">
        <Select label="Filtrer par statut" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="">Tous</option>
          <option value="nouveau">Nouveau</option>
          <option value="en-cours">En cours</option>
          <option value="documents-requis">Documents requis</option>
          <option value="soumis">Soumis</option>
          <option value="finalise">Finalisé</option>
        </Select>
      </div>
      <Card>
        <CardHeader title={`${rows.length} dossier(s)`} />
        <Table columns={columns} data={rows} rowKey={(r) => r.id} pageSize={10} />
      </Card>
    </div>
  );
}
