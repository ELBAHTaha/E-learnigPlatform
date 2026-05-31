import { useState } from "react";
import { Bell, KeyRound, Save, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  toast,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/store/auth";

export function SettingsPage() {
  const logout = useAuth((s) => s.logout);
  const [savedNotifs, setSavedNotifs] = useState(false);
  const [savedPwd, setSavedPwd] = useState(false);

  return (
    <div className="container-page py-10">
      <PageHeader
        title="Paramètres"
        description="Préférences de compte, notifications et sécurité."
      />
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader
            title="Notifications"
            action={<Bell className="h-5 w-5 text-accent" />}
          />
          <CardBody className="space-y-3">
            <Checkbox label="Recevoir les annonces de l'académie par email" defaultChecked />
            <Checkbox label="Alertes pour les nouvelles sessions et rappels de cours" defaultChecked />
            <Checkbox label="Notifications hebdomadaires de progression" />
            <Checkbox label="Recevoir les nouveautés et offres commerciales" />
            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                rightIcon={<Save className="h-4 w-4" />}
                onClick={() => {
                  setSavedNotifs(true);
                  toast.success("Préférences enregistrées");
                }}
              >
                {savedNotifs ? "Enregistré" : "Enregistrer"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Sécurité"
            action={<KeyRound className="h-5 w-5 text-accent" />}
          />
          <CardBody className="space-y-4">
            <Input label="Mot de passe actuel" type="password" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nouveau mot de passe" type="password" />
              <Input label="Confirmation" type="password" />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSavedPwd(true);
                  toast.success("Mot de passe mis à jour");
                }}
              >
                {savedPwd ? "Mis à jour" : "Changer le mot de passe"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="border-danger/30">
          <CardHeader title="Zone sensible" />
          <CardBody className="space-y-3">
            <p className="text-sm text-navy-500">
              Supprimer votre compte est une action irréversible. Toutes vos données seront effacées.
            </p>
            <div>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => {
                  if (confirm("Supprimer définitivement votre compte ?")) {
                    logout();
                    toast.info("Compte supprimé (démo)");
                  }
                }}
              >
                Supprimer mon compte
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
