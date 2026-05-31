import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { announcementsApi } from "@/api";
import { AnnouncementFeed } from "@/features/announcements/AnnouncementFeed";

export function AnnoncesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["announcements", "eleve"],
    queryFn: () => announcementsApi.listAnnouncements("eleve"),
  });
  return (
    <div>
      <PageHeader
        title="Annonces"
        description="Toutes les communications de la direction et de la pédagogie."
      />
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <AnnouncementFeed items={data ?? []} />
      )}
    </div>
  );
}
