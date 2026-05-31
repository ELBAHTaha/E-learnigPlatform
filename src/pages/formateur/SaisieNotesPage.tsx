import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  Select,
  Table,
  Textarea,
  type Column,
  toast,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { enrollmentsApi, formationsApi, gradesApi, usersApi } from "@/api";
import { useAuth } from "@/store/auth";
import { formatDate } from "@/lib/format";
import type { Grade } from "@/types";

const gradeSchema = z.object({
  eleveId: z.string().min(1, "Élève requis"),
  assessment: z.string().min(2, "Intitulé requis"),
  score: z.coerce.number().min(0, "Doit être ≥ 0"),
  outOf: z.coerce.number().min(1, "Doit être ≥ 1"),
  date: z.string().min(1, "Date requise"),
  comment: z.string().optional(),
});
type GradeValues = z.infer<typeof gradeSchema>;

export function SaisieNotesPage() {
  const user = useAuth((s) => s.user)!;
  const qc = useQueryClient();
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentsApi.listEnrollments({}),
  });
  const { data: eleves } = useQuery({
    queryKey: ["users", "eleve"],
    queryFn: () => usersApi.listEleves(),
  });

  const mine = (formations ?? []).filter((f) => f.formateurId === user.id);
  const [formationId, setFormationId] = useState<string>("");
  const currentId = formationId || mine[0]?.id || "";

  const { data: grades } = useQuery({
    queryKey: ["grades", { formationId: currentId }],
    queryFn: () => gradesApi.listGrades({ formationId: currentId }),
    enabled: !!currentId,
  });

  const studentsInFormation = useMemo(() => {
    const ids = new Set(
      (enrollments ?? [])
        .filter((e) => e.formationId === currentId && e.status === "approuvee")
        .map((e) => e.eleveId)
    );
    return (eleves ?? []).filter((e) => ids.has(e.id));
  }, [enrollments, eleves, currentId]);

  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GradeValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      eleveId: "",
      assessment: "",
      score: 0,
      outOf: 20,
      date: new Date().toISOString().slice(0, 10),
      comment: "",
    },
  });

  const addGrade = useMutation({
    mutationFn: (v: GradeValues) =>
      gradesApi.addGrade({
        ...v,
        formationId: currentId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grades"] });
      setOpen(false);
      reset();
      toast.success("Note enregistrée");
    },
  });

  const onSubmit = (v: GradeValues) => addGrade.mutate(v);

  const columns: Column<Grade>[] = [
    {
      key: "student",
      header: "Élève",
      cell: (g) => {
        const e = eleves?.find((x) => x.id === g.eleveId);
        return (
          <span className="font-medium text-navy-900">
            {e ? `${e.firstName} ${e.lastName}` : g.eleveId}
          </span>
        );
      },
      sortAccessor: (g) => {
        const e = eleves?.find((x) => x.id === g.eleveId);
        return e ? `${e.firstName} ${e.lastName}` : "";
      },
    },
    {
      key: "assessment",
      header: "Évaluation",
      cell: (g) => g.assessment,
      sortAccessor: (g) => g.assessment,
    },
    {
      key: "score",
      header: "Note",
      cell: (g) => (
        <span className="font-semibold text-navy-900">
          {g.score} / {g.outOf}
        </span>
      ),
      sortAccessor: (g) => g.score / g.outOf,
    },
    {
      key: "date",
      header: "Date",
      cell: (g) => formatDate(g.date),
      sortAccessor: (g) => new Date(g.date).getTime(),
    },
    {
      key: "comment",
      header: "Commentaire",
      cell: (g) => <span className="text-navy-500">{g.comment ?? "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Saisie des notes"
        description="Enregistrez les évaluations de vos élèves par formation."
        action={
          <Button
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
            disabled={!currentId}
          >
            Ajouter une note
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Select
          label="Formation"
          value={currentId}
          onChange={(e) => setFormationId(e.target.value)}
        >
          {mine.length === 0 ? (
            <option value="">Aucune formation</option>
          ) : (
            mine.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))
          )}
        </Select>
      </div>

      <Card>
        <CardHeader title="Notes enregistrées" description={`${grades?.length ?? 0} évaluation(s)`} />
        <Table
          columns={columns}
          data={grades ?? []}
          rowKey={(g) => g.id}
          empty="Aucune note enregistrée pour cette formation."
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle note"
        description="Renseignez les détails de l'évaluation."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button
              variant="secondary"
              loading={addGrade.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Select label="Élève" required error={errors.eleveId?.message} {...register("eleveId")}>
            <option value="">Sélectionnez un élève</option>
            {studentsInFormation.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </Select>
          <Input
            label="Intitulé"
            placeholder="DS 4 — Géométrie"
            required
            error={errors.assessment?.message}
            {...register("assessment")}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Score"
              type="number"
              step="0.25"
              required
              error={errors.score?.message}
              {...register("score")}
            />
            <Input
              label="Sur"
              type="number"
              required
              error={errors.outOf?.message}
              {...register("outOf")}
            />
          </div>
          <Input
            label="Date"
            type="date"
            required
            error={errors.date?.message}
            {...register("date")}
          />
          <Textarea
            label="Commentaire (optionnel)"
            placeholder="Remarques générales..."
            {...register("comment")}
          />
        </form>
      </Modal>
    </div>
  );
}
