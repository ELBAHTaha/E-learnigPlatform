import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User as UserIcon, Phone, MapPin, UserPlus } from "lucide-react";
import { Button, Checkbox, Input, Select, toast } from "@/components/ui";
import { AuthLayout } from "./AuthLayout";
import { authApi } from "@/api";
import { useAuth } from "@/store/auth";
import { POLES } from "@/lib/constants";

const schema = z
  .object({
    firstName: z.string().min(2, "Prénom requis."),
    lastName: z.string().min(2, "Nom requis."),
    email: z.string().email("Adresse email invalide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirm: z.string(),
    phone: z.string().optional(),
    city: z.string().optional(),
    interestedPole: z.string().optional(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Veuillez accepter les conditions." }),
    }),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
  });

type RegisterValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirm: "",
      phone: "",
      city: "",
      interestedPole: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        passwordConfirmation: values.confirm,
        phone: values.phone,
        city: values.city,
        interestedPole: values.interestedPole || undefined,
      });
      setSession(res.user, res.token);
      toast.success("Compte créé", "Bienvenue dans l'AFG Academy !");
      navigate("/eleve");
    } catch (err) {
      toast.error("Inscription échouée", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez la communauté AFG en quelques étapes."
      footer={
        <>
          Vous avez déjà un compte ?{" "}
          <Link to="/connexion" className="font-semibold text-accent">
            Connectez-vous
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Prénom"
            required
            placeholder="Ex : Sara"
            leftIcon={<UserIcon className="h-4 w-4" />}
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Nom"
            required
            placeholder="Ex : El Idrissi"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          placeholder="vous@exemple.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Téléphone"
            placeholder="+212 6 ..."
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Ville"
            placeholder="Casablanca"
            leftIcon={<MapPin className="h-4 w-4" />}
            error={errors.city?.message}
            {...register("city")}
          />
        </div>
        <Select
          label="Pôle d'intérêt"
          hint="Pour vous proposer les formations adaptées."
          {...register("interestedPole")}
        >
          <option value="">Choisissez un pôle</option>
          {POLES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Mot de passe"
            type="password"
            required
            placeholder="8 caractères min."
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirmation"
            type="password"
            required
            placeholder="Retapez le mot de passe"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </div>
        <div>
          <Checkbox
            label="J'accepte les conditions d'utilisation et la politique de confidentialité."
            {...register("terms")}
          />
          {errors.terms?.message && (
            <p className="mt-1 text-xs text-danger">{errors.terms.message}</p>
          )}
        </div>
        <Button
          type="submit"
          variant="secondary"
          fullWidth
          size="lg"
          loading={loading}
          rightIcon={<UserPlus className="h-4 w-4" />}
        >
          Créer mon compte
        </Button>
      </form>
    </AuthLayout>
  );
}
