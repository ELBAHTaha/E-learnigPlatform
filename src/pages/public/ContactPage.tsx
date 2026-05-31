import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Textarea,
  toast,
} from "@/components/ui";
import { ACADEMY } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "Veuillez renseigner votre nom."),
  email: z.string().email("Adresse email invalide."),
  subject: z.string().min(2, "Veuillez choisir un sujet."),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères."),
});

type ContactValues = z.infer<typeof schema>;

export function ContactPage() {
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "Informations sur une formation", message: "" },
  });

  const onSubmit = async (values: ContactValues) => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    toast.success("Message envoyé", `Merci ${values.name}, nous vous répondrons rapidement.`);
    reset();
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-navy-800 text-white">
        <div className="container-page py-14">
          <p className="text-sm uppercase tracking-wider text-accent font-medium">
            Contact
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-display font-bold">
            Discutons de votre projet
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            Vous avez une question sur nos formations, sur l'inscription ou un
            projet à l'étranger ? Écrivez-nous, notre équipe vous répondra sous 24h.
          </p>
        </div>
      </section>

      <section className="container-page py-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardBody>
            <h2 className="text-lg font-display font-semibold text-navy-900">
              Envoyez-nous un message
            </h2>
            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nom complet"
                  required
                  error={errors.name?.message}
                  placeholder="Votre nom"
                  {...register("name")}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  error={errors.email?.message}
                  placeholder="vous@exemple.com"
                  {...register("email")}
                />
              </div>
              <Select label="Sujet" required error={errors.subject?.message} {...register("subject")}>
                <option>Informations sur une formation</option>
                <option>Inscription</option>
                <option>Immigration</option>
                <option>Partenariat</option>
                <option>Autre</option>
              </Select>
              <Textarea
                label="Message"
                required
                rows={6}
                placeholder="Décrivez votre demande..."
                error={errors.message?.message}
                {...register("message")}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="secondary"
                  loading={sending}
                  rightIcon={<Send className="h-4 w-4" />}
                >
                  Envoyer le message
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-display font-semibold text-navy-900">Coordonnées</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Adresse</p>
                    <p className="text-navy-500">{ACADEMY.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Téléphone</p>
                    <a href={`tel:${ACADEMY.phone}`} className="text-navy-500 hover:text-accent">
                      {ACADEMY.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Email</p>
                    <a
                      href={`mailto:${ACADEMY.email}`}
                      className="text-navy-500 hover:text-accent break-all"
                    >
                      {ACADEMY.email}
                    </a>
                  </div>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <div className="h-48 bg-navy-100 flex items-center justify-center text-navy-400">
              <MapPin className="h-8 w-8" />
              <span className="ml-2 text-sm">Carte interactive (à venir)</span>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
