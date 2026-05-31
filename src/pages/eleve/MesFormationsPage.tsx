import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/store/auth";
import { coursesApi, enrollmentsApi, formationsApi } from "@/api";
import { POLE_LABELS } from "@/lib/constants";
import { ResourceList } from "@/features/courses/ResourceList";

export function MesFormationsPage() {
  const user = useAuth((s) => s.user)!;
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["enrollments", { eleveId: user.id }],
    queryFn: () => enrollmentsApi.listEnrollments({ eleveId: user.id }),
  });
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: resources } = useQuery({
    queryKey: ["resources", "all"],
    queryFn: () => coursesApi.listResources(),
  });

  const approved = (enrollments ?? []).filter((e) => e.status === "approuvee");
  const [activeId, setActiveId] = useState<string | null>(null);
  const currentId = activeId ?? approved[0]?.formationId ?? null;
  const formation = formations?.find((f) => f.id === currentId);
  const formationResources = (resources ?? []).filter(
    (r) => r.formationId === currentId
  );

  return (
    <div>
      <PageHeader
        title="Mes formations"
        description="Retrouvez vos cours, exercices, corrigés et vidéos."
      />

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : approved.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Aucune formation active"
          description="Inscrivez-vous à une formation pour accéder aux contenus pédagogiques."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <Card>
              <CardBody className="p-3">
                <ul className="space-y-1">
                  {approved.map((e) => {
                    const f = formations?.find((x) => x.id === e.formationId);
                    if (!f) return null;
                    const isActive = currentId === f.id;
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(f.id)}
                          className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                            isActive
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-navy-50"
                          }`}
                        >
                          <p className="text-sm font-medium text-navy-900 line-clamp-1">
                            {f.title}
                          </p>
                          <p className="mt-0.5 text-xs text-navy-500">
                            {POLE_LABELS[f.pole]}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
            </Card>
          </aside>

          <div>
            {formation ? (
              <Card>
                <CardHeader
                  title={formation.title}
                  description={`${POLE_LABELS[formation.pole]} · ${formation.subcategory}`}
                  action={
                    <Badge tone="accent" size="sm">{formation.level}</Badge>
                  }
                />
                <CardBody>
                  <Tabs defaultValue="cours">
                    <TabsList>
                      <TabsTrigger value="cours">Cours</TabsTrigger>
                      <TabsTrigger value="exercice">Exercices</TabsTrigger>
                      <TabsTrigger value="corrige">Corrigés</TabsTrigger>
                      <TabsTrigger value="video">Vidéos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cours">
                      <ResourceList
                        resources={formationResources.filter((r) => r.type === "cours")}
                      />
                    </TabsContent>
                    <TabsContent value="exercice">
                      <ResourceList
                        resources={formationResources.filter((r) => r.type === "exercice")}
                      />
                    </TabsContent>
                    <TabsContent value="corrige">
                      <ResourceList
                        resources={formationResources.filter((r) => r.type === "corrige")}
                      />
                    </TabsContent>
                    <TabsContent value="video">
                      <ResourceList
                        resources={formationResources.filter((r) => r.type === "video")}
                      />
                    </TabsContent>
                  </Tabs>
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
