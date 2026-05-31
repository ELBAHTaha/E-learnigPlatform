import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  Select,
  Skeleton,
  toast,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { coursesApi, formationsApi } from "@/api";
import { useAuth } from "@/store/auth";
import { POLE_LABELS } from "@/lib/constants";
import { ResourceList } from "@/features/courses/ResourceList";
import type { ResourceType } from "@/types";

export function MesCoursPage() {
  const user = useAuth((s) => s.user)!;
  const qc = useQueryClient();
  const { data: formations, isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: resources } = useQuery({
    queryKey: ["resources", "all"],
    queryFn: () => coursesApi.listResources(),
  });

  const mine = (formations ?? []).filter((f) => f.formateurId === user.id);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const formationId = currentId ?? mine[0]?.id ?? null;
  const formation = mine.find((f) => f.id === formationId);

  const formationResources = (resources ?? []).filter((r) => r.formationId === formationId);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<ResourceType>("cours");
  const [uploadTitle, setUploadTitle] = useState("");

  const addResource = useMutation({
    mutationFn: () =>
      coursesApi.addResource({
        formationId: formationId!,
        title: uploadTitle,
        type: uploadType,
        size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
        url: "#",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources"] });
      setUploadOpen(false);
      setUploadTitle("");
      toast.success("Ressource ajoutée");
    },
  });

  const deleteResource = useMutation({
    mutationFn: (id: string) => coursesApi.deleteResource(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Ressource supprimée");
    },
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div>
      <PageHeader
        title="Mes cours"
        description="Gérez les contenus pédagogiques de vos formations."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside>
          <Card>
            <CardBody className="p-3">
              <ul className="space-y-1">
                {mine.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentId(f.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                        formationId === f.id ? "bg-primary/10 border border-primary/20" : "hover:bg-navy-50"
                      }`}
                    >
                      <p className="text-sm font-medium text-navy-900 line-clamp-1">{f.title}</p>
                      <p className="mt-0.5 text-xs text-navy-500">{POLE_LABELS[f.pole]}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </aside>

        {formation && (
          <Card>
            <CardHeader
              title={formation.title}
              description={`${formation.subcategory} · ${formation.enrolled} élèves`}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setUploadOpen(true)}
                >
                  Nouvelle ressource
                </Button>
              }
            />
            <CardBody>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge tone="neutral" size="sm">
                  Cours : {formationResources.filter((r) => r.type === "cours").length}
                </Badge>
                <Badge tone="neutral" size="sm">
                  Exercices : {formationResources.filter((r) => r.type === "exercice").length}
                </Badge>
                <Badge tone="neutral" size="sm">
                  Corrigés : {formationResources.filter((r) => r.type === "corrige").length}
                </Badge>
                <Badge tone="neutral" size="sm">
                  Vidéos : {formationResources.filter((r) => r.type === "video").length}
                </Badge>
              </div>
              <ResourceList
                resources={formationResources}
                onDelete={(id) => deleteResource.mutate(id)}
              />
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Ajouter une ressource"
        description="Le fichier sera mis à disposition des élèves inscrits."
        footer={
          <>
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="secondary"
              onClick={() => addResource.mutate()}
              disabled={!uploadTitle.trim()}
              loading={addResource.isPending}
              leftIcon={<Upload className="h-4 w-4" />}
            >
              Téléverser
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Type"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as ResourceType)}
            required
          >
            <option value="cours">Cours</option>
            <option value="exercice">Exercice</option>
            <option value="corrige">Corrigé</option>
            <option value="video">Vidéo</option>
          </Select>
          <Input
            label="Titre de la ressource"
            placeholder="Ex : Chapitre 4 — Fonctions"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            required
          />
          <div className="rounded-xl border-2 border-dashed border-navy-200 p-6 text-center bg-navy-50">
            <Upload className="h-6 w-6 text-navy-400 mx-auto" />
            <p className="mt-2 text-sm text-navy-500">
              Glissez-déposez votre fichier ou cliquez pour parcourir
            </p>
            <p className="text-xs text-navy-400 mt-1">(upload simulé pour la démo)</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
