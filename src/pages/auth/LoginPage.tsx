import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Mail, Lock, ShieldCheck } from "lucide-react";
import { Button, Card, CardBody, Input, toast } from "@/components/ui";
import { AuthLayout } from "./AuthLayout";
import { authApi } from "@/api";
import { useAuth } from "@/store/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { demoAccounts } from "@/mocks/users";
import type { Role } from "@/types";

const schema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

type LoginValues = z.infer<typeof schema>;

function destinationFor(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "formateur":
      return "/formateur";
    case "conseiller":
      return "/conseiller";
    case "eleve":
    default:
      return "/eleve";
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuth((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      setSession(res.user, res.token);
      toast.success(`Bienvenue ${res.user.firstName}`);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? destinationFor(res.user.role));
    } catch (err) {
      toast.error("Connexion échouée", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue("email", email);
    setValue("password", "demo");
  };

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accédez à votre espace personnel."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="font-semibold text-accent">
            Créez-en un
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-accent hover:underline"
            onClick={() => toast.info("Fonctionnalité à venir", "La récupération de mot de passe sera disponible prochainement.")}
          >
            Mot de passe oublié ?
          </button>
        </div>
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          rightIcon={<LogIn className="h-4 w-4" />}
        >
          Se connecter
        </Button>
      </form>

      <Card className="mt-6 bg-navy-50/60 border-dashed">
        <CardBody>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-navy-900">Comptes de démonstration</h3>
          </div>
          <p className="text-xs text-navy-500 mb-3">
            Cliquez pour pré-remplir le formulaire. Le mot de passe « demo » est accepté pour toutes les démos.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => fillDemo(d.email)}
                className="text-left rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <p className="font-medium text-navy-900">{ROLE_LABELS[d.role]}</p>
                <p className="text-navy-500 truncate">{d.email}</p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>
    </AuthLayout>
  );
}
