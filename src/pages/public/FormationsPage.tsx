import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Search, SlidersHorizontal } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Select,
  Skeleton,
} from "@/components/ui";
import { POLES, POLE_LABELS, SUBCATEGORIES } from "@/lib/constants";
import { formationsApi } from "@/api";
import { formatPrice } from "@/lib/format";
import type { Pole } from "@/types";

export function FormationsPage() {
  const [params, setParams] = useSearchParams();
  const pole = (params.get("pole") as Pole | null) ?? undefined;
  const subcategory = params.get("subcategory") ?? undefined;
  const level = params.get("level") ?? undefined;
  const [search, setSearch] = useState(params.get("search") ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["formations", { pole, subcategory, level, search }],
    queryFn: () =>
      formationsApi.listFormations({ pole, subcategory, level, search }),
  });

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const subcategoriesAvailable = useMemo(
    () => (pole ? SUBCATEGORIES[pole] : Array.from(new Set(Object.values(SUBCATEGORIES).flat()))),
    [pole]
  );

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("search", search.trim() || undefined);
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-navy-800 text-white">
        <div className="container-page py-12 lg:py-16">
          <p className="text-sm uppercase tracking-wider text-accent font-medium">
            Catalogue
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-display font-bold">
            Nos formations
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            Explorez l'ensemble de nos programmes répartis dans nos quatre pôles.
            Filtrez par pôle, niveau ou mot-clé pour trouver la formation qui
            vous correspond.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside>
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2 text-navy-900 font-semibold">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtres
                </div>
                <form onSubmit={onSubmitSearch}>
                  <Input
                    label="Recherche"
                    placeholder="Mot-clé..."
                    leftIcon={<Search className="h-4 w-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
                <Select
                  label="Pôle"
                  value={pole ?? ""}
                  onChange={(e) => {
                    setParam("pole", e.target.value || undefined);
                    setParam("subcategory", undefined);
                  }}
                >
                  <option value="">Tous les pôles</option>
                  {POLES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Sous-catégorie"
                  value={subcategory ?? ""}
                  onChange={(e) => setParam("subcategory", e.target.value || undefined)}
                >
                  <option value="">Toutes</option>
                  {subcategoriesAvailable.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Niveau"
                  value={level ?? ""}
                  onChange={(e) => setParam("level", e.target.value || undefined)}
                >
                  <option value="">Tous niveaux</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                  <option value="Tous niveaux">Tous niveaux</option>
                </Select>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setParams(new URLSearchParams(), { replace: true });
                    setSearch("");
                  }}
                >
                  Réinitialiser
                </Button>
              </CardBody>
            </Card>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-navy-500">
                {isLoading
                  ? "Chargement..."
                  : `${data?.length ?? 0} formation${(data?.length ?? 0) > 1 ? "s" : ""}`}
                {pole && ` · ${POLE_LABELS[pole]}`}
              </p>
            </div>
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardBody>
                      <Skeleton className="h-4 w-24 mb-3" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : data && data.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.map((f) => (
                  <Card
                    key={f.id}
                    className="overflow-hidden flex flex-col hover:shadow-elevated transition-shadow"
                  >
                    <div
                      className="h-2"
                      style={{ background: f.imageColor ?? "#E8954A" }}
                    />
                    <CardBody className="flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="accent" size="sm">{POLE_LABELS[f.pole]}</Badge>
                        <Badge tone="neutral" size="sm">{f.subcategory}</Badge>
                        <Badge tone="primary" size="sm">{f.level}</Badge>
                      </div>
                      <h3 className="mt-3 font-display font-semibold text-navy-900 text-lg">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-sm text-navy-500 flex-1">
                        {f.description}
                      </p>
                      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-navy-400">Durée</dt>
                          <dd className="text-navy-700 font-medium">{f.duration}</dd>
                        </div>
                        <div>
                          <dt className="text-navy-400">Modalité</dt>
                          <dd className="text-navy-700 font-medium">{f.modality ?? "—"}</dd>
                        </div>
                      </dl>
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-navy-100">
                        <span className="text-base font-semibold text-navy-900">
                          {formatPrice(f.price)}
                        </span>
                        <Link to={`/formations/${f.id}`}>
                          <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                            Découvrir
                          </Button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="h-6 w-6" />}
                title="Aucune formation trouvée"
                description="Essayez d'élargir vos critères de recherche ou de réinitialiser les filtres."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setParams(new URLSearchParams(), { replace: true });
                      setSearch("");
                    }}
                  >
                    Réinitialiser
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
