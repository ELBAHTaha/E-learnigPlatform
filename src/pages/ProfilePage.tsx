import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Save, User as UserIcon } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  toast,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/store/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function ProfilePage() {
  const user = useAuth((s) => s.user);
  const setSession = useAuth((s) => s.setSession);
  const token = useAuth((s) => s.token);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      city: user?.city ?? "",
    },
  });

  if (!user) {
    return (
      <div className="container-page py-10">
        <p>Vous devez être connecté pour accéder à votre profil.</p>
      </div>
    );
  }

  const onSubmit = async (v: Values) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSession({ ...user, ...v }, token ?? "");
    setSaving(false);
    toast.success("Profil mis à jour");
  };

  return (
    <div className="container-page py-10">
      <PageHeader
        title="Mon profil"
        description="Vos informations personnelles et préférences."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardBody className="text-center">
            <Avatar
              name={`${user.firstName} ${user.lastName}`}
              size="xl"
              className="mx-auto"
            />
            <h2 className="mt-4 font-display font-semibold text-navy-900">
              {user.firstName} {user.lastName}
            </h2>
            <Badge tone="primary" size="sm" className="mt-2">
              {ROLE_LABELS[user.role]}
            </Badge>
            <p className="mt-4 text-xs text-navy-500">
              Membre depuis {formatDate(user.createdAt)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Informations personnelles" />
          <CardBody>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Prénom"
                  required
                  leftIcon={<UserIcon className="h-4 w-4" />}
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
                <Input
                  label="Nom"
                  required
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>
              <Input
                label="Email"
                type="email"
                required
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Téléphone"
                  leftIcon={<Phone className="h-4 w-4" />}
                  {...register("phone")}
                />
                <Input
                  label="Ville"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  {...register("city")}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="secondary"
                  loading={saving}
                  rightIcon={<Save className="h-4 w-4" />}
                >
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
