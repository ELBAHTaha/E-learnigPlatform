import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText, MessageSquare, XCircle } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, EmptyState, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { immigrationApi, usersApi } from "@/api";
import { useAuth } from "@/store/auth";
import { StatusTracker } from "@/features/immigration/StatusTracker";
import { formatDate } from "@/lib/format";
import { IMMIGRATION_STATUS_LABELS, IMMIGRATION_STATUS_TONES } from "@/lib/constants";

export function DossierPage() {
  const user = useAuth((s) => s.user)!;
  const { data: dossiers, isLoading } = useQuery({
    queryKey: ["dossiers", { eleveId: user.id }],
    queryFn: () => immigrationApi.listDossiers({ eleveId: user.id }),
  });
  const { data: conseillers } = useQuery({
    queryKey: ["users", "conseiller"],
    queryFn: () => usersApi.listConseillers(),
  });

  return (
    <div>
      <PageHeader
        title="Mon dossier immigration"
        description="Suivez l'avancement de votre projet à l'étranger."
      />

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !dossiers || dossiers.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Aucun dossier immigration"
          description="Si vous êtes inscrit à une formation Immigration, votre dossier apparaîtra ici."
        />
      ) : (
        <div className="space-y-6">
          {dossiers.map((d) => {
            const conseiller = conseillers?.find((c) => c.id === d.conseillerId);
            const docsProvided = d.documents.filter((x) => x.provided).length;
            return (
              <Card key={d.id}>
                <CardHeader
                  title={`${d.destination} — ${d.programType}`}
                  description={`Ouvert le ${formatDate(d.openedAt)}`}
                  action={
                    <Badge tone={IMMIGRATION_STATUS_TONES[d.status] as any}>
                      {IMMIGRATION_STATUS_LABELS[d.status]}
                    </Badge>
                  }
                />
                <CardBody className="space-y-6">
                  <StatusTracker current={d.status} />

                  {conseiller && (
                    <div className="rounded-xl bg-navy-50 p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary text-white inline-flex items-center justify-center text-sm font-semibold">
                        {conseiller.firstName[0]}
                        {conseiller.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900">
                          {conseiller.firstName} {conseiller.lastName}
                        </p>
                        <p className="text-xs text-navy-500">Votre conseiller dédié</p>
                      </div>
                      <a
                        href={`mailto:${conseiller.email}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Contacter
                      </a>
                    </div>
                  )}

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-navy-900">
                        Documents requis
                      </h3>
                      <span className="text-xs text-navy-500">
                        {docsProvided} / {d.documents.length} fournis
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {d.documents.map((doc) => (
                        <li
                          key={doc.id}
                          className="flex items-start gap-3 rounded-lg border border-navy-100 px-3 py-2"
                        >
                          {doc.provided ? (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-navy-300 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-navy-900">{doc.name}</p>
                            {doc.notes && (
                              <p className="text-xs text-navy-500 mt-0.5">{doc.notes}</p>
                            )}
                          </div>
                          <Badge tone={doc.provided ? "success" : "warning"} size="sm">
                            {doc.provided ? "Fourni" : "En attente"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {d.notes.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-accent" />
                        <h3 className="text-sm font-semibold text-navy-900">Notes</h3>
                      </div>
                      <ul className="space-y-2">
                        {d.notes.map((n) => (
                          <li key={n.id} className="rounded-lg bg-navy-50 px-3 py-2">
                            <p className="text-sm text-navy-700">{n.content}</p>
                            <p className="mt-1 text-xs text-navy-500">
                              {n.author} · {formatDate(n.date)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
