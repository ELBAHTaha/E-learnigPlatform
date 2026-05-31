import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Mail,
  MessageSquarePlus,
  Phone,
  Send,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  Textarea,
  toast,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { immigrationApi, usersApi } from "@/api";
import { StatusTracker } from "@/features/immigration/StatusTracker";
import { useAuth } from "@/store/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  IMMIGRATION_STATUS_LABELS,
  IMMIGRATION_STATUS_TONES,
} from "@/lib/constants";
import type { ImmigrationStatus } from "@/types";

export function DossierDetailPage() {
  const { id = "" } = useParams();
  const user = useAuth((s) => s.user)!;
  const qc = useQueryClient();

  const { data: dossier } = useQuery({
    queryKey: ["dossier", id],
    queryFn: () => immigrationApi.getDossier(id),
  });
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });

  const eleve = eleves?.find((x) => x.id === dossier?.eleveId);
  const [note, setNote] = useState("");

  const updateStatus = useMutation({
    mutationFn: (status: ImmigrationStatus) =>
      immigrationApi.updateDossierStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dossier", id] });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
      toast.success("Statut mis à jour");
    },
  });

  const toggleDoc = useMutation({
    mutationFn: ({ docId, provided }: { docId: string; provided: boolean }) =>
      immigrationApi.toggleDocument(id, docId, provided),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossier", id] }),
  });

  const addNote = useMutation({
    mutationFn: (content: string) =>
      immigrationApi.addNote(id, `${user.firstName} ${user.lastName}`, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dossier", id] });
      setNote("");
      toast.success("Note ajoutée");
    },
  });

  if (!dossier) {
    return (
      <div className="container-page py-10">
        <p className="text-navy-500">Dossier introuvable.</p>
        <Link to="/conseiller/dossiers" className="mt-3 inline-block text-accent">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const provided = dossier.documents.filter((d) => d.provided).length;

  return (
    <div>
      <div className="mb-3">
        <Breadcrumbs
          items={[
            { label: "Conseil", to: "/conseiller" },
            { label: "Dossiers", to: "/conseiller/dossiers" },
            { label: dossier.destination },
          ]}
        />
      </div>
      <PageHeader
        title={`${dossier.destination} — ${dossier.programType}`}
        description={`Dossier de ${eleve ? `${eleve.firstName} ${eleve.lastName}` : ""} · Ouvert le ${formatDate(dossier.openedAt)}`}
        action={
          <Badge tone={IMMIGRATION_STATUS_TONES[dossier.status] as any} size="md">
            {IMMIGRATION_STATUS_LABELS[dossier.status]}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Avancement" />
            <CardBody>
              <StatusTracker current={dossier.status} />
              <div className="mt-6 max-w-sm">
                <Select
                  label="Mettre à jour le statut"
                  value={dossier.status}
                  onChange={(e) =>
                    updateStatus.mutate(e.target.value as ImmigrationStatus)
                  }
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en-cours">En cours</option>
                  <option value="documents-requis">Documents requis</option>
                  <option value="soumis">Soumis</option>
                  <option value="finalise">Finalisé</option>
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Documents"
              description={`${provided} / ${dossier.documents.length} fournis`}
            />
            <CardBody>
              <ul className="space-y-2">
                {dossier.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg border border-navy-100 px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleDoc.mutate({ docId: doc.id, provided: !doc.provided })
                      }
                      className="shrink-0"
                      aria-label="Basculer le statut"
                    >
                      {doc.provided ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-navy-300" />
                      )}
                    </button>
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
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Communication" />
            <CardBody className="space-y-4">
              <div>
                <Textarea
                  label="Ajouter une note"
                  placeholder="Détails de l'appel, remarques..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<MessageSquarePlus className="h-4 w-4" />}
                    onClick={() => addNote.mutate(note.trim())}
                    disabled={!note.trim()}
                    loading={addNote.isPending}
                  >
                    Enregistrer la note
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900 mb-2">Historique</p>
                {dossier.notes.length === 0 ? (
                  <p className="text-sm text-navy-500">Aucune note enregistrée.</p>
                ) : (
                  <ul className="space-y-2">
                    {dossier.notes.map((n) => (
                      <li key={n.id} className="rounded-lg bg-navy-50 px-3 py-2">
                        <p className="text-sm text-navy-700">{n.content}</p>
                        <p className="mt-1 text-xs text-navy-500">
                          {n.author} · {formatDateTime(n.date)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4">
          {eleve && (
            <Card>
              <CardHeader title="Coordonnées de l'élève" />
              <CardBody className="space-y-3">
                <p className="font-semibold text-navy-900">
                  {eleve.firstName} {eleve.lastName}
                </p>
                {eleve.city && <p className="text-sm text-navy-500">{eleve.city}</p>}
                <a
                  href={`mailto:${eleve.email}`}
                  className="flex items-center gap-2 text-sm text-navy-700 hover:text-accent"
                >
                  <Mail className="h-4 w-4" /> {eleve.email}
                </a>
                {eleve.phone && (
                  <a
                    href={`tel:${eleve.phone}`}
                    className="flex items-center gap-2 text-sm text-navy-700 hover:text-accent"
                  >
                    <Phone className="h-4 w-4" /> {eleve.phone}
                  </a>
                )}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <a href={`tel:${eleve.phone}`}>
                    <Button fullWidth size="sm" variant="outline" leftIcon={<Phone className="h-4 w-4" />}>
                      Appeler
                    </Button>
                  </a>
                  <a href={`mailto:${eleve.email}`}>
                    <Button fullWidth size="sm" variant="secondary" leftIcon={<Send className="h-4 w-4" />}>
                      Email
                    </Button>
                  </a>
                </div>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
