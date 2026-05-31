import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  Skeleton,
} from "@/components/ui";
import { formationsApi, usersApi } from "@/api";
import { POLE_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export function FormationDetailPage() {
  const { id = "" } = useParams();
  const { data: formation, isLoading } = useQuery({
    queryKey: ["formation", id],
    queryFn: () => formationsApi.getFormation(id),
  });

  const { data: formateur } = useQuery({
    queryKey: ["user", formation?.formateurId],
    queryFn: () => (formation?.formateurId ? usersApi.getUser(formation.formateurId) : undefined),
    enabled: !!formation?.formateurId,
  });

  if (isLoading) {
    return (
      <div className="container-page py-10 space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-display font-semibold text-navy-900">
          Formation introuvable
        </h1>
        <p className="mt-2 text-navy-500">
          Cette formation n'existe pas ou a été retirée du catalogue.
        </p>
        <Link to="/formations" className="inline-block mt-4">
          <Button>Retour au catalogue</Button>
        </Link>
      </div>
    );
  }

  const spotsLeft = Math.max(0, formation.capacity - formation.enrolled);

  return (
    <div>
      <section
        className="text-white"
        style={{
          background: `linear-gradient(135deg, ${formation.imageColor ?? "#1B2A4A"} 0%, #1B2A4A 100%)`,
        }}
      >
        <div className="container-page py-10">
          <Breadcrumbs
            items={[
              { label: "Accueil", to: "/" },
              { label: "Formations", to: "/formations" },
              { label: formation.title },
            ]}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="accent" size="sm">{POLE_LABELS[formation.pole]}</Badge>
            <Badge tone="primary" size="sm">{formation.subcategory}</Badge>
            <Badge tone="neutral" size="sm">{formation.level}</Badge>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-display font-bold max-w-3xl">
            {formation.title}
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl">{formation.description}</p>
          {formation.rating && (
            <div className="mt-4 inline-flex items-center gap-1 text-accent">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">{formation.rating.toFixed(1)}</span>
              <span className="text-white/70 text-sm">/ 5</span>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h2 className="text-lg font-display font-semibold text-navy-900">
                Programme
              </h2>
              <p className="mt-3 text-sm text-navy-700 leading-relaxed">
                {formation.longDescription ?? formation.description}
              </p>
              {formation.highlights && formation.highlights.length > 0 && (
                <>
                  <h3 className="mt-6 font-display font-semibold text-navy-900">
                    Points forts
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {formation.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-navy-700">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardBody>
          </Card>

          {formation.documentsRequired && formation.documentsRequired.length > 0 && (
            <Card>
              <CardBody>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-display font-semibold text-navy-900">
                    Pièces à fournir
                  </h2>
                </div>
                <ul className="mt-3 space-y-2">
                  {formation.documentsRequired.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-navy-700">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {formateur && (
            <Card>
              <CardBody>
                <h2 className="text-lg font-display font-semibold text-navy-900">
                  Votre formateur
                </h2>
                <div className="mt-3 flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-white inline-flex items-center justify-center font-semibold">
                    {formateur.firstName[0]}
                    {formateur.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">
                      {formateur.firstName} {formateur.lastName}
                    </p>
                    {"specialties" in formateur && (
                      <p className="text-sm text-navy-500">
                        {(formateur as any).specialties.join(" · ")}
                      </p>
                    )}
                    {"bio" in formateur && (formateur as any).bio && (
                      <p className="mt-2 text-sm text-navy-700">{(formateur as any).bio}</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-navy-500">
                  Tarif
                </p>
                <p className="text-3xl font-display font-bold text-navy-900">
                  {formatPrice(formation.price)}
                </p>
                <p className="text-xs text-navy-500 mt-1">
                  Possibilité de paiement en plusieurs fois
                </p>
              </div>

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-navy-700">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <span>{formation.duration}</span>
                </li>
                {formation.schedule && (
                  <li className="flex items-center gap-2 text-navy-700">
                    <Calendar className="h-4 w-4 text-accent shrink-0" />
                    <span>{formation.schedule}</span>
                  </li>
                )}
                {formation.modality && (
                  <li className="flex items-center gap-2 text-navy-700">
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span>{formation.modality}</span>
                  </li>
                )}
                <li className="flex items-center gap-2 text-navy-700">
                  <Layers className="h-4 w-4 text-accent shrink-0" />
                  <span>Niveau : {formation.level}</span>
                </li>
                <li className="flex items-center gap-2 text-navy-700">
                  <Users className="h-4 w-4 text-accent shrink-0" />
                  <span>
                    {spotsLeft > 0
                      ? `${spotsLeft} places disponibles`
                      : "Complet"}
                  </span>
                </li>
                <li className="flex items-center gap-2 text-navy-700">
                  <GraduationCap className="h-4 w-4 text-accent shrink-0" />
                  <span>{POLE_LABELS[formation.pole]}</span>
                </li>
              </ul>

              <Link to="/inscription" className="block">
                <Button
                  fullWidth
                  variant="secondary"
                  size="lg"
                  disabled={spotsLeft === 0}
                >
                  S'inscrire
                </Button>
              </Link>
              <Link to="/contact" className="block">
                <Button fullWidth variant="outline">
                  Demander conseil
                </Button>
              </Link>
            </CardBody>
          </Card>
        </aside>
      </section>
    </div>
  );
}
