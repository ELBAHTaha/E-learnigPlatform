import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Trash2, UserCog } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { usersApi } from "@/api";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Role, User } from "@/types";

const userSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "formateur", "eleve", "conseiller"]),
  phone: z.string().optional(),
  city: z.string().optional(),
});
type UserValues = z.infer<typeof userSchema>;

function UsersTable({ role }: { role: Role }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: users } = useQuery({
    queryKey: ["users", role],
    queryFn: () => usersApi.listUsers(role),
  });

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return (users ?? []).filter((u) =>
      term
        ? `${u.firstName} ${u.lastName} ${u.email} ${u.city ?? ""}`.toLowerCase().includes(term)
        : true
    );
  }, [users, search]);

  const remove = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur supprimé");
    },
  });

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Utilisateur",
      cell: (u) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-navy-900 truncate">
              {u.firstName} {u.lastName}
            </p>
            <p className="text-xs text-navy-500 truncate">{u.email}</p>
          </div>
        </div>
      ),
      sortAccessor: (u) => `${u.lastName} ${u.firstName}`,
    },
    { key: "city", header: "Ville", cell: (u) => u.city ?? "—", sortAccessor: (u) => u.city ?? "" },
    { key: "phone", header: "Téléphone", cell: (u) => u.phone ?? "—" },
    {
      key: "createdAt",
      header: "Inscrit le",
      cell: (u) => formatDate(u.createdAt),
      sortAccessor: (u) => new Date(u.createdAt).getTime(),
    },
    {
      key: "status",
      header: "Statut",
      cell: (u) => (
        <Badge tone={u.active ? "success" : "neutral"} size="sm">
          {u.active ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (u) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Supprimer ${u.firstName} ${u.lastName} ?`)) remove.mutate(u.id);
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
    <Card>
      <CardHeader
        title={`${filtered.length} ${ROLE_LABELS[role].toLowerCase()}(s)`}
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
      <Table columns={columns} data={filtered} rowKey={(u) => u.id} pageSize={10} />
    </Card>
  );
}

export function UsersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { firstName: "", lastName: "", email: "", role: "eleve", phone: "", city: "" },
  });

  const create = useMutation({
    mutationFn: (v: UserValues) => usersApi.createUser({ ...v, active: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      reset();
      toast.success("Utilisateur créé");
    },
  });

  return (
    <div>
      <PageHeader
        title="Gestion des utilisateurs"
        description="Élèves, formateurs et conseillers."
        action={
          <Button
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Nouvel utilisateur
          </Button>
        }
      />

      <Tabs defaultValue="eleve">
        <TabsList>
          <TabsTrigger value="eleve">Élèves</TabsTrigger>
          <TabsTrigger value="formateur">Formateurs</TabsTrigger>
          <TabsTrigger value="conseiller">Conseillers</TabsTrigger>
        </TabsList>
        <TabsContent value="eleve">
          <UsersTable role="eleve" />
        </TabsContent>
        <TabsContent value="formateur">
          <UsersTable role="formateur" />
        </TabsContent>
        <TabsContent value="conseiller">
          <UsersTable role="conseiller" />
        </TabsContent>
      </Tabs>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvel utilisateur"
        description="Créez un compte pour un nouvel élève, formateur ou conseiller."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button
              variant="secondary"
              loading={create.isPending}
              leftIcon={<UserCog className="h-4 w-4" />}
              onClick={handleSubmit((v) => create.mutate(v))}
            >
              Créer
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Prénom" required error={errors.firstName?.message} {...register("firstName")} />
            <Input label="Nom" required error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Rôle" required {...register("role")}>
              <option value="eleve">Élève</option>
              <option value="formateur">Formateur</option>
              <option value="conseiller">Conseiller immigration</option>
              <option value="admin">Administrateur</option>
            </Select>
            <Input label="Téléphone" {...register("phone")} />
          </div>
          <Input label="Ville" {...register("city")} />
        </form>
      </Modal>
    </div>
  );
}
