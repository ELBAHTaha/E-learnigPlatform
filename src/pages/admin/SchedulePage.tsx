import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  Select,
  Table,
  toast,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formationsApi, roomsApi, scheduleApi, usersApi } from "@/api";
import { formatDateTime } from "@/lib/format";
import { hasConflict } from "@/api/schedule";
import type { ScheduleSession } from "@/types";

const schema = z
  .object({
    formationId: z.string().min(1),
    formateurId: z.string().min(1),
    roomId: z.string().optional(),
    title: z.string().min(2),
    date: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    meetingUrl: z.string().optional(),
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "L'heure de fin doit être après le début",
    path: ["endTime"],
  });
type Values = z.infer<typeof schema>;

export function SchedulePage() {
  const qc = useQueryClient();
  const { data: sessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => scheduleApi.listSessions(),
  });
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });
  const { data: formateurs } = useQuery({
    queryKey: ["users", "formateur"],
    queryFn: () => usersApi.listFormateurs(),
  });
  const { data: rooms } = useQuery({ queryKey: ["rooms"], queryFn: () => roomsApi.listRooms() });

  const [open, setOpen] = useState(false);
  const [conflict, setConflict] = useState<ScheduleSession | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      formationId: "",
      formateurId: "",
      roomId: "",
      title: "",
      date: new Date().toISOString().slice(0, 10),
      startTime: "18:00",
      endTime: "19:30",
      meetingUrl: "",
    },
  });

  const create = useMutation({
    mutationFn: async (v: Values) => {
      const start = new Date(`${v.date}T${v.startTime}`).toISOString();
      const end = new Date(`${v.date}T${v.endTime}`).toISOString();
      const c = hasConflict(
        { roomId: v.roomId, formateurId: v.formateurId, start, end },
        sessions ?? []
      );
      if (c) {
        setConflict(c);
        throw new Error("conflict");
      }
      return scheduleApi.createSession({
        formationId: v.formationId,
        formateurId: v.formateurId,
        roomId: v.roomId || undefined,
        title: v.title,
        start,
        end,
        meetingUrl: v.meetingUrl || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      setOpen(false);
      reset();
      setConflict(null);
      toast.success("Session créée");
    },
    onError: (e) => {
      if (e instanceof Error && e.message === "conflict") return;
      toast.error("Erreur lors de la création");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => scheduleApi.deleteSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session supprimée");
    },
  });

  const columns: Column<ScheduleSession>[] = [
    {
      key: "title",
      header: "Session",
      cell: (s) => <span className="font-medium text-navy-900">{s.title}</span>,
      sortAccessor: (s) => s.title,
    },
    {
      key: "start",
      header: "Début",
      cell: (s) => formatDateTime(s.start),
      sortAccessor: (s) => new Date(s.start).getTime(),
    },
    {
      key: "formateur",
      header: "Formateur",
      cell: (s) => {
        const f = formateurs?.find((x) => x.id === s.formateurId);
        return f ? `${f.firstName} ${f.lastName}` : "—";
      },
    },
    {
      key: "room",
      header: "Salle",
      cell: (s) => rooms?.find((r) => r.id === s.roomId)?.name ?? "—",
    },
    {
      key: "mode",
      header: "",
      cell: (s) =>
        s.meetingUrl ? (
          <Badge tone="info" size="sm">En ligne</Badge>
        ) : (
          <Badge tone="neutral" size="sm">Présentiel</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      cell: (s) => (
        <button
          type="button"
          onClick={() => {
            if (confirm("Supprimer cette session ?")) remove.mutate(s.id);
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
        title="Emploi du temps"
        description="Planification globale : formateur, salle et créneau."
        action={
          <Button
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Nouvelle session
          </Button>
        }
      />

      <Card>
        <CardHeader title={`${sessions?.length ?? 0} session(s) planifiée(s)`} />
        <Table columns={columns} data={sessions ?? []} rowKey={(s) => s.id} pageSize={10} />
      </Card>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setConflict(null); }}
        title="Planifier une session"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setOpen(false); setConflict(null); }}>
              Annuler
            </Button>
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
          {conflict && (
            <Card className="bg-red-50 border-red-200">
              <CardBody className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-danger">Conflit détecté</p>
                  <p className="mt-1 text-xs text-navy-700">
                    Le formateur ou la salle est déjà occupé(e) sur la session
                    « {conflict.title} » ({formatDateTime(conflict.start)}).
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Formation" required error={errors.formationId?.message} {...register("formationId")}>
              <option value="">—</option>
              {(formations ?? []).map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </Select>
            <Select label="Formateur" required error={errors.formateurId?.message} {...register("formateurId")}>
              <option value="">—</option>
              {(formateurs ?? []).map((f) => (
                <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>
              ))}
            </Select>
          </div>
          <Input label="Intitulé de la session" required error={errors.title?.message} {...register("title")} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Date" type="date" required error={errors.date?.message} {...register("date")} />
            <Input label="Début" type="time" required error={errors.startTime?.message} {...register("startTime")} />
            <Input label="Fin" type="time" required error={errors.endTime?.message} {...register("endTime")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Salle" {...register("roomId")}>
              <option value="">—</option>
              {(rooms ?? []).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
            <Input
              label="URL visioconférence (optionnel)"
              placeholder="https://meet..."
              {...register("meetingUrl")}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
