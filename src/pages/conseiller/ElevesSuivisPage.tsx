import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import {
  Card,
  CardHeader,
  Table,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { immigrationApi, usersApi } from "@/api";
import { useAuth } from "@/store/auth";

interface Row {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  dossiersCount: number;
  firstDossierId?: string;
}

export function ElevesSuivisPage() {
  const user = useAuth((s) => s.user)!;
  const { data: dossiers } = useQuery({
    queryKey: ["dossiers", { conseillerId: user.id }],
    queryFn: () => immigrationApi.listDossiers({ conseillerId: user.id }),
  });
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });

  const rows: Row[] = useMemo(() => {
    const byEleve = new Map<string, { count: number; firstId: string }>();
    (dossiers ?? []).forEach((d) => {
      const entry = byEleve.get(d.eleveId);
      if (entry) entry.count += 1;
      else byEleve.set(d.eleveId, { count: 1, firstId: d.id });
    });
    return Array.from(byEleve.entries()).map(([eleveId, info]) => {
      const e = eleves?.find((x) => x.id === eleveId);
      return {
        id: eleveId,
        name: e ? `${e.firstName} ${e.lastName}` : eleveId,
        email: e?.email ?? "",
        phone: e?.phone,
        city: e?.city,
        dossiersCount: info.count,
        firstDossierId: info.firstId,
      };
    });
  }, [dossiers, eleves]);

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
    { key: "city", header: "Ville", cell: (r) => r.city ?? "—" },
    {
      key: "contact",
      header: "Contact",
      cell: (r) => (
        <div className="flex items-center gap-2">
          {r.phone && (
            <a href={`tel:${r.phone}`} className="text-navy-700 hover:text-accent" title="Appeler">
              <Phone className="h-4 w-4" />
            </a>
          )}
          {r.email && (
            <a href={`mailto:${r.email}`} className="text-navy-700 hover:text-accent" title="Email">
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: "dossiers",
      header: "Dossiers",
      cell: (r) => r.dossiersCount,
      sortAccessor: (r) => r.dossiersCount,
    },
    {
      key: "action",
      header: "",
      cell: (r) =>
        r.firstDossierId ? (
          <Link
            to={`/conseiller/dossiers/${r.firstDossierId}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Voir dossier
          </Link>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Élèves suivis"
        description="Personnes pour lesquelles vous gérez un dossier d'immigration."
      />
      <Card>
        <CardHeader title={`${rows.length} élève(s)`} />
        <Table columns={columns} data={rows} rowKey={(r) => r.id} />
      </Card>
    </div>
  );
}
