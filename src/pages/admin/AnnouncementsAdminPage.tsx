import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Modal,
  Textarea,
  toast,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { announcementsApi } from "@/api";
import { formatRelative } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/types";

const schema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  audienceAll: z.boolean(),
  audienceEleve: z.boolean(),
  audienceFormateur: z.boolean(),
  audienceConseiller: z.boolean(),
  pinned: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

export function AnnouncementsAdminPage() {
  const qc = useQueryClient();
  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementsApi.listAnnouncements(),
  });

  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      audienceAll: true,
      audienceEleve: false,
      audienceFormateur: false,
      audienceConseiller: false,
      pinned: false,
    },
  });

  const create = useMutation({
    mutationFn: (v: Values) => {
      const audience: Role[] | "tous" = v.audienceAll
        ? "tous"
        : ([
            v.audienceEleve && "eleve",
            v.audienceFormateur && "formateur",
            v.audienceConseiller && "conseiller",
          ].filter(Boolean) as Role[]);
      return announcementsApi.createAnnouncement({
        title: v.title,
        body: v.body,
        audience,
        author: "Direction AFG",
        pinned: v.pinned,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      setOpen(false);
      reset();
      toast.success("Annonce publiée");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => announcementsApi.deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Annonce supprimée");
    },
  });

  return (
    <div>
      <PageHeader
        title="Annonces"
        description="Publiez des informations à destination des élèves, formateurs ou de l'ensemble de l'académie."
        action={
          <Button
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Nouvelle annonce
          </Button>
        }
      />

      <div className="space-y-3">
        {(announcements ?? []).map((a) => (
          <Card key={a.id} className={a.pinned ? "border-accent/40 bg-accent/5" : ""}>
            <CardHeader
              title={a.title}
              description={`${a.author} · ${formatRelative(a.publishedAt)}`}
              action={
                <button
                  type="button"
                  onClick={() => confirm(`Supprimer « ${a.title} » ?`) && remove.mutate(a.id)}
                  className="text-danger hover:bg-red-50 rounded-md p-1.5"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              }
            />
            <CardBody>
              <p className="text-sm text-navy-700">{a.body}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.audience === "tous" ? (
                  <Badge tone="primary" size="sm">Tous</Badge>
                ) : (
                  a.audience.map((r) => (
                    <Badge key={r} tone="neutral" size="sm">
                      {ROLE_LABELS[r]}
                    </Badge>
                  ))
                )}
                {a.pinned && <Badge tone="accent" size="sm">Épinglé</Badge>}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle annonce"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button
              variant="secondary"
              loading={create.isPending}
              onClick={handleSubmit((v) => create.mutate(v))}
            >
              Publier
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Titre" required error={errors.title?.message} {...register("title")} />
          <Textarea label="Message" required rows={5} error={errors.body?.message} {...register("body")} />
          <div className="rounded-xl border border-navy-100 p-4">
            <p className="text-sm font-medium text-navy-900 mb-3">Audience</p>
            <div className="space-y-2">
              <Checkbox label="Toute l'académie" {...register("audienceAll")} />
              <Checkbox label="Élèves uniquement" {...register("audienceEleve")} />
              <Checkbox label="Formateurs uniquement" {...register("audienceFormateur")} />
              <Checkbox label="Conseillers immigration" {...register("audienceConseiller")} />
            </div>
          </div>
          <Checkbox label="Épingler en haut de la liste" {...register("pinned")} />
        </form>
      </Modal>
    </div>
  );
}
