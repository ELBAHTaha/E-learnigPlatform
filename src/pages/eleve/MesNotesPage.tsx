import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardBody,
  CardHeader,
  Select,
  Table,
  type Column,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formationsApi, gradesApi } from "@/api";
import { useAuth } from "@/store/auth";
import { formatDate } from "@/lib/format";
import type { Grade } from "@/types";

export function MesNotesPage() {
  const user = useAuth((s) => s.user)!;
  const { data: grades } = useQuery({
    queryKey: ["grades", { eleveId: user.id }],
    queryFn: () => gradesApi.listGrades({ eleveId: user.id }),
  });
  const { data: formations } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationsApi.listFormations(),
  });

  const formationIds = useMemo(
    () => Array.from(new Set((grades ?? []).map((g) => g.formationId))),
    [grades]
  );
  const [selected, setSelected] = useState<string>("");
  const currentId = selected || formationIds[0] || "";

  const filtered = (grades ?? []).filter((g) => g.formationId === currentId);
  const chartData = [...filtered]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((g) => ({
      name: g.assessment,
      date: formatDate(g.date, "d MMM"),
      score: Number(((g.score / g.outOf) * 20).toFixed(2)),
    }));

  const avg =
    filtered.length > 0
      ? filtered.reduce((acc, g) => acc + (g.score / g.outOf) * 20, 0) / filtered.length
      : 0;

  const columns: Column<Grade>[] = [
    {
      key: "assessment",
      header: "Évaluation",
      cell: (g) => <span className="font-medium text-navy-900">{g.assessment}</span>,
      sortAccessor: (g) => g.assessment,
    },
    {
      key: "date",
      header: "Date",
      cell: (g) => formatDate(g.date),
      sortAccessor: (g) => new Date(g.date).getTime(),
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
      key: "comment",
      header: "Commentaire",
      cell: (g) => <span className="text-navy-500">{g.comment ?? "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mes notes"
        description="Suivez votre progression dans chacune de vos formations."
      />

      <div className="mb-6 max-w-sm">
        <Select
          label="Filtrer par formation"
          value={currentId}
          onChange={(e) => setSelected(e.target.value)}
        >
          {formationIds.length === 0 ? (
            <option value="">Aucune note disponible</option>
          ) : (
            formationIds.map((id) => {
              const f = formations?.find((x) => x.id === id);
              return (
                <option key={id} value={id}>
                  {f?.title ?? id}
                </option>
              );
            })
          )}
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Évolution" description="Notes ramenées sur 20" />
            <CardBody>
              {chartData.length === 0 ? (
                <p className="text-sm text-navy-500 text-center py-8">
                  Aucune note pour cette formation.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
                      <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                      <YAxis domain={[0, 20]} stroke="#64748B" fontSize={12} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#E8954A"
                        strokeWidth={2.5}
                        dot={{ fill: "#E8954A", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Détail des notes" />
            <Table
              columns={columns}
              data={filtered}
              rowKey={(g) => g.id}
              empty="Aucune note enregistrée pour cette formation."
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-navy-500">Moyenne /20</p>
              <p className="mt-2 text-4xl font-display font-bold text-navy-900">
                {avg.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-navy-500">
                Calculée sur {filtered.length} évaluation(s)
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-navy-500">
                Meilleure note
              </p>
              {filtered.length > 0 ? (
                (() => {
                  const best = [...filtered].sort(
                    (a, b) => b.score / b.outOf - a.score / a.outOf
                  )[0];
                  return (
                    <>
                      <p className="mt-2 text-2xl font-display font-bold text-navy-900">
                        {best.score} / {best.outOf}
                      </p>
                      <p className="mt-1 text-xs text-navy-500">{best.assessment}</p>
                    </>
                  );
                })()
              ) : (
                <p className="mt-2 text-sm text-navy-500">—</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
