import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  Input,
  Modal,
  Table,
  toast,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { roomsApi } from "@/api";
import type { Room } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  capacity: z.coerce.number().min(1),
  building: z.string().optional(),
  equipment: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function RoomsPage() {
  const qc = useQueryClient();
  const { data: rooms } = useQuery({ queryKey: ["rooms"], queryFn: () => roomsApi.listRooms() });
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", capacity: 20, building: "", equipment: "" },
  });

  const create = useMutation({
    mutationFn: (v: Values) =>
      roomsApi.createRoom({
        name: v.name,
        capacity: v.capacity,
        building: v.building,
        equipment: v.equipment ? v.equipment.split(",").map((s) => s.trim()) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setOpen(false);
      reset();
      toast.success("Salle créée");
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => roomsApi.deleteRoom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Salle supprimée");
    },
  });

  const columns: Column<Room>[] = [
    { key: "name", header: "Nom", cell: (r) => <span className="font-medium text-navy-900">{r.name}</span>, sortAccessor: (r) => r.name },
    { key: "building", header: "Bâtiment", cell: (r) => r.building ?? "—" },
    { key: "capacity", header: "Capacité", cell: (r) => r.capacity, sortAccessor: (r) => r.capacity },
    {
      key: "equipment",
      header: "Équipement",
      cell: (r) =>
        r.equipment && r.equipment.length > 0 ? (
          <span className="text-xs text-navy-500">{r.equipment.join(", ")}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Supprimer la salle ${r.name} ?`)) remove.mutate(r.id);
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
        title="Gestion des salles"
        description="Inventaire des espaces et équipements."
        action={
          <Button
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Nouvelle salle
          </Button>
        }
      />
      <Card>
        <CardHeader title={`${rooms?.length ?? 0} salle(s)`} />
        <Table columns={columns} data={rooms ?? []} rowKey={(r) => r.id} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle salle"
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
          <Input label="Nom" required error={errors.name?.message} {...register("name")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Bâtiment" {...register("building")} />
            <Input label="Capacité" type="number" required error={errors.capacity?.message} {...register("capacity")} />
          </div>
          <Input
            label="Équipement"
            hint="Séparer par des virgules"
            placeholder="Vidéoprojecteur, Tableau blanc"
            {...register("equipment")}
          />
        </form>
      </Modal>
    </div>
  );
}
