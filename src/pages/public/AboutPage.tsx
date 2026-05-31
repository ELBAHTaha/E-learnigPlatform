import { Link } from "react-router-dom";
import { ArrowRight, Compass, Heart, Lightbulb, Target } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import { POLES, ACADEMY } from "@/lib/constants";

const pillars = [
  {
    icon: Compass,
    title: "Mission",
    text: "Offrir un accompagnement éducatif de qualité à chaque élève, quel que soit son niveau ou son projet — du collège au monde professionnel, au Maroc comme à l'étranger.",
  },
  {
    icon: Heart,
    title: "Valeurs",
    text: "Bienveillance, exigence pédagogique, ouverture sur le monde et engagement individuel. Chaque parcours compte.",
  },
  {
    icon: Lightbulb,
    title: "Vision",
    text: "Devenir l'académie de référence au Maroc pour la formation multidisciplinaire et l'accompagnement à l'international.",
  },
  {
    icon: Target,
    title: "Objectifs 2026",
    text: "Accompagner +1000 élèves, élargir notre offre de langues, et structurer des partenariats avec des écoles étrangères.",
  },
];

export function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-navy-800 text-white">
        <div className="container-page py-16">
          <p className="text-sm uppercase tracking-wider text-accent font-medium">
            À propos
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-display font-bold max-w-3xl">
            Une académie pensée pour vous accompagner durablement.
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl">
            {ACADEMY.name} est une académie multidisciplinaire basée au Maroc.
            Nous regroupons sous un même toit quatre pôles complémentaires pour
            répondre aux ambitions de nos élèves : réussir leurs études, se
            former professionnellement, partir à l'étranger ou apprendre une
            nouvelle langue.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <Card key={p.title}>
              <CardBody>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent mb-3">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-navy-900">{p.title}</h3>
                <p className="mt-1 text-sm text-navy-500">{p.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-navy-100">
        <div className="container-page py-14">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-navy-900">
            La structure des quatre pôles
          </h2>
          <p className="mt-2 text-navy-500 max-w-2xl">
            Chaque pôle propose un parcours complet, encadré par des formateurs
            spécialistes et soutenu par notre direction pédagogique.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {POLES.map((p) => (
              <Card key={p.id}>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div
                      className="h-12 w-1 rounded-full"
                      style={{ background: p.color }}
                    />
                    <div>
                      <h3 className="font-display font-semibold text-navy-900 text-lg">
                        {p.label}
                      </h3>
                      <p className="mt-1 text-sm text-navy-500">{p.tagline}</p>
                      <Link
                        to={`/formations?pole=${p.id}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent"
                      >
                        Voir les formations <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="rounded-2xl bg-navy-50 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-display font-semibold text-navy-900">
            Discutons de votre projet
          </h2>
          <p className="mt-2 text-navy-500 max-w-xl mx-auto">
            Notre équipe est disponible pour vous orienter vers la formation la
            mieux adaptée à vos objectifs.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button>Nous contacter</Button>
            </Link>
            <Link to="/formations">
              <Button variant="outline">Voir le catalogue</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
