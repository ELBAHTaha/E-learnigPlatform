import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FolderKanban,
} from "lucide-react";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { immigrationApi, usersApi } from "@/api";
import { useAuth } from "@/store/auth";
import { formatRelative } from "@/lib/format";
import { IMMIGRATION_STATUS_LABELS, IMMIGRATION_STATUS_TONES } from "@/lib/constants";

export function ConseillerDashboard() {
  const user = useAuth((s) => s.user)!;
  const { data: dossiers } = useQuery({
    queryKey: ["dossiers", { conseillerId: user.id }],
    queryFn: () => immigrationApi.listDossiers({ conseillerId: user.id }),
  });
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });

  const all = dossiers ?? [];
  const active = all.filter((d) => d.status !== "finalise").length;
  const docsRequis = all.filter((d) => d.status === "documents-requis").length;
  const finalises = all.filter((d) => d.status === "finalise").length;

  return (
    <div>
      <PageHeader
        title={`Bonjour ${user.firstName}`}
        description="Tableau de bord de vos dossiers d'immigration."
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-navy-500">Dossiers actifs</p>
              <p className="text-2xl font-display font-semibold text-navy-900">{active}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-warning inline-flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-navy-500">Documents en attente</p>
              <p className="text-2xl font-display font-semibold text-navy-900">{docsRequis}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 text-success inline-flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-navy-500">Dossiers finalisés</p>
              <p className="text-2xl font-display font-semibold text-navy-900">{finalises}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Dossiers récents"
          action={
            <Link
              to="/conseiller/dossiers"
              className="text-xs text-accent font-medium inline-flex items-center gap-1"
            >
              Tous les dossiers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <CardBody className="p-0">
          <ul className="divide-y divide-navy-100">
            {all.slice(0, 5).map((d) => {
              const e = eleves?.find((x) => x.id === d.eleveId);
              return (
                <li key={d.id} className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent inline-flex items-center justify-center shrink-0">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">
                      {e ? `${e.firstName} ${e.lastName}` : d.eleveId} —{" "}
                      {d.destination} ({d.programType})
                    </p>
                    <p className="text-xs text-navy-500">
                      Mis à jour {formatRelative(d.updatedAt)}
                    </p>
                  </div>
                  <Badge tone={IMMIGRATION_STATUS_TONES[d.status] as any}>
                    {IMMIGRATION_STATUS_LABELS[d.status]}
                  </Badge>
                  <Link
                    to={`/conseiller/dossiers/${d.id}`}
                    className="text-sm font-medium text-accent"
                  >
                    Ouvrir
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
