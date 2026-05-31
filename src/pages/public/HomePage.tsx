import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  GraduationCap,
  Quote,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { POLES, ACADEMY, POLE_LABELS } from "@/lib/constants";
import { formationsApi } from "@/api";
import { formatPrice } from "@/lib/format";

const values = [
  {
    icon: GraduationCap,
    title: "Pédagogie de qualité",
    description: "Des formateurs experts, des contenus actualisés et un suivi personnalisé.",
  },
  {
    icon: Users,
    title: "Communauté engagée",
    description: "Un réseau d'élèves et de professionnels qui s'entraident pour réussir.",
  },
  {
    icon: CalendarCheck,
    title: "Flexibilité",
    description: "Cours en présentiel, à distance ou hybride — adaptés à votre rythme.",
  },
  {
    icon: Award,
    title: "Certifications reconnues",
    description: "Préparations TOEIC, Goethe, certificats AFG et accompagnement officiel.",
  },
];

const testimonials = [
  {
    name: "Imane B.",
    role: "Bachelière 2025",
    text: "Grâce au programme de Maths Spé, j'ai eu mention très bien au Bac. Les formateurs sont attentifs et disponibles.",
  },
  {
    name: "Yassine T.",
    role: "Professionnel en reconversion",
    text: "La formation en marketing digital m'a permis de décrocher un poste en agence en moins de 3 mois.",
  },
  {
    name: "Sara M.",
    role: "Étudiante au Canada",
    text: "Le pôle immigration m'a accompagnée pas à pas. Mon dossier a été validé du premier coup.",
  },
];

export function HomePage() {
  const { data: formations } = useQuery({
    queryKey: ["formations", { featured: true }],
    queryFn: () => formationsApi.listFormations(),
  });

  const featured = (formations ?? [])
    .filter((f) => (f.rating ?? 0) >= 4.7)
    .slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-navy-800 text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
        <div className="container-page relative py-20 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Nouvelle session — rentrée 2026
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight max-w-3xl">
            {ACADEMY.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/80">
            AFG est une académie multidisciplinaire au Maroc, qui accompagne
            élèves et professionnels à travers quatre pôles d'excellence : soutien
            scolaire, formation continue, immigration et langues étrangères.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/formations">
              <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Découvrir les formations
              </Button>
            </Link>
            <Link to="/inscription">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Créer un compte
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
            {[
              { value: "30+", label: "Formations" },
              { value: "6", label: "Formateurs experts" },
              { value: "500+", label: "Élèves accompagnés" },
              { value: "4.8/5", label: "Satisfaction" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-display font-bold text-accent">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-navy-900">
              Quatre pôles, une ambition
            </h2>
            <p className="mt-2 text-navy-500 max-w-2xl">
              Un accompagnement personnalisé du collège au monde professionnel.
            </p>
          </div>
          <Link
            to="/formations"
            className="text-sm font-medium text-accent inline-flex items-center gap-1"
          >
            Voir le catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POLES.map((p) => (
            <Link
              key={p.id}
              to={`/formations?pole=${p.id}`}
              className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all"
            >
              <div
                className="h-2 w-12 rounded-full mb-4"
                style={{ background: p.color }}
              />
              <h3 className="text-lg font-display font-semibold text-navy-900">
                {p.label}
              </h3>
              <p className="mt-2 text-sm text-navy-500">{p.tagline}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                Découvrir <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-navy-100">
        <div className="container-page py-16">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-navy-900">
            Pourquoi choisir AFG ?
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-3">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold text-navy-900">{v.title}</h3>
                <p className="mt-1 text-sm text-navy-500">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-navy-900">
              Formations populaires
            </h2>
            <p className="mt-2 text-navy-500">
              Les programmes les mieux notés par nos élèves.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((f) => (
            <Card key={f.id} className="overflow-hidden flex flex-col hover:shadow-elevated transition-shadow">
              <div
                className="h-2"
                style={{ background: f.imageColor ?? "#E8954A" }}
              />
              <CardBody className="flex-1 flex flex-col">
                <Badge tone="accent" size="sm">{POLE_LABELS[f.pole]}</Badge>
                <h3 className="mt-3 font-display font-semibold text-navy-900 text-lg">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-navy-500 flex-1">{f.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-900">
                    {formatPrice(f.price)}
                  </span>
                  <Link to={`/formations/${f.id}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Découvrir
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-navy-50 border-y border-navy-100">
        <div className="container-page py-16">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-navy-900">
            Ils nous font confiance
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardBody>
                  <Quote className="h-6 w-6 text-accent" />
                  <p className="mt-3 text-sm text-navy-700 leading-relaxed">{t.text}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary text-white inline-flex items-center justify-center text-xs font-semibold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">{t.name}</p>
                      <p className="text-xs text-navy-500">{t.role}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-navy-800 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <UserCheck className="h-10 w-10 text-accent" />
            <h2 className="mt-4 text-2xl sm:text-3xl font-display font-semibold max-w-xl">
              Prêt à rejoindre l'académie ?
            </h2>
            <p className="mt-2 text-white/80 max-w-xl">
              Créez votre compte en quelques minutes et accédez à votre espace
              personnel pour suivre vos formations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/inscription">
                <Button variant="secondary" size="lg">S'inscrire maintenant</Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
