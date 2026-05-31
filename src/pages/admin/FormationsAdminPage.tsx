import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Modal,
  Select,
  Table,
  Textarea,
  toast,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formationsApi, usersApi } from "@/api";
import { POLES, POLE_LABELS, SUBCATEGORIES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Formation, Pole } from "@/types";

const schema = z.object({
  title: z.string().min(3),
  pole: z.enum(["soutien-scolaire", "formation-continue", "immigration", "langues"]),
  subcategory: z.string().min(2),
  level: z.enum(["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"]),
  description: z.string().min(10),
  duration: z.string().min(2),
  price: z.coerce.number().min(0),
  capacity: z.coerce.number().min(1),
  formateurId: z.string().optional(),
  modality: z.enum(["Présentiel", "À distance", "Hybride"]).optional(),
});
type Values = z.infer<typeof schema>;

export function FormationsAdminPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: formateurs } = useQuery({
    queryKey: ["users", "formateur"],
    queryFn: () => usersApi.listFormateurs(),
  });

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return (formations ?? []).filter((f) =>
      term ? `${f.title} ${f.description} ${POLE_LABELS[f.pole]}`.toLowerCase().includes(term) : true
    );
  }, [formations, search]);

  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      pole: "soutien-scolaire",
      subcategory: "Mathématiques",
      level: "Débutant",
      description: "",
      duration: "",
      price: 0,
      capacity: 20,
      formateurId: "",
      modality: "Présentiel",
    },
  });
  const watchedPole = watch("pole") as Pole;

  const create = useMutation({
    mutationFn: (v: Values) => formationsApi.createFormation(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["formations"] });
      setOpen(false);
      reset();
      toast.success("Formation créée");
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => formationsApi.deleteFormation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Formation supprimée");
    },
  });

  const columns: Column<Formation>[] = [
    {
      key: "title",
      header: "Formation",
      cell: (f) => (
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-1 rounded-full shrink-0"
            style={{ background: f.imageColor ?? "#E8954A" }}
          />
          <div>
            <p className="font-medium text-navy-900">{f.title}</p>
            <p className="text-xs text-navy-500">{f.subcategory}</p>
          </div>
        </div>
      ),
      sortAccessor: (f) => f.title,
    },
    { key: "pole", header: "Pôle", cell: (f) => POLE_LABELS[f.pole], sortAccessor: (f) => POLE_LABELS[f.pole] },
    {
      key: "level",
      header: "Niveau",
      cell: (f) => <Badge tone="primary" size="sm">{f.level}</Badge>,
    },
    {
      key: "enroll",
      header: "Inscrits",
      cell: (f) => `${f.enrolled} / ${f.capacity}`,
      sortAccessor: (f) => f.enrolled,
    },
    {
      key: "price",
      header: "Tarif",
      cell: (f) => formatPrice(f.price),
      sortAccessor: (f) => f.price,
    },
    {
      key: "actions",
      header: "",
      cell: (f) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Supprimer « ${f.title} » ?`)) remove.mutate(f.id);
          }}
          className="text-danger hover:bg-red-50 rounded-md p-1.5"
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestion des formations"
        description="Catalogue complet des quatre pôles."
        action={
          <Button
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Nouvelle formation
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={`${filtered.length} formation(s)`}
          action={
            <div className="w-64">
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          }
        />
        <Table columns={columns} data={filtered} rowKey={(f) => f.id} pageSize={10} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle formation"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button
              variant="secondary"
              loading={create.isPending}
              onClick={handleSubmit((v) => create.mutate(v))}
            >
              Créer
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Titre" required error={errors.title?.message} {...register("title")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Pôle" required {...register("pole")}>
              {POLES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
            <Select label="Sous-catégorie" required {...register("subcategory")}>
              {SUBCATEGORIES[watchedPole].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Niveau" required {...register("level")}>
              <option>Débutant</option>
              <option>Intermédiaire</option>
              <option>Avancé</option>
              <option>Tous niveaux</option>
            </Select>
            <Select label="Modalité" {...register("modality")}>
              <option>Présentiel</option>
              <option>À distance</option>
              <option>Hybride</option>
            </Select>
            <Select label="Formateur" {...register("formateurId")}>
              <option value="">—</option>
              {(formateurs ?? []).map((f) => (
                <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Durée" placeholder="9 mois" required error={errors.duration?.message} {...register("duration")} />
            <Input label="Tarif (MAD)" type="number" required error={errors.price?.message} {...register("price")} />
            <Input label="Capacité" type="number" required error={errors.capacity?.message} {...register("capacity")} />
          </div>
          <Textarea
            label="Description"
            required
            rows={4}
            error={errors.description?.message}
            {...register("description")}
          />
        </form>
      </Modal>
    </div>
  );
}
