import { useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MapPin, Video } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ScheduleSession } from "@/types";

interface WeeklyCalendarProps {
  sessions: ScheduleSession[];
  getRoomName?: (roomId?: string) => string | undefined;
  getFormateurName?: (formateurId: string) => string | undefined;
  onSessionClick?: (s: ScheduleSession) => void;
}

export function WeeklyCalendar({
  sessions,
  getRoomName,
  getFormateurName,
  onSessionClick,
}: WeeklyCalendarProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleSession[]>();
    for (const s of sessions) {
      const d = new Date(s.start);
      const key = format(d, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    map.forEach((arr) =>
      arr.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    );
    return map;
  }, [sessions]);

  return (
    <div className="rounded-2xl border border-navy-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-navy-900">
            Semaine du {format(weekStart, "d MMM", { locale: fr })} au{" "}
            {format(addDays(weekStart, 6), "d MMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Préc.
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          >
            Aujourd'hui
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Suiv.
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-navy-100">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const items = byDay.get(key) ?? [];
          const isToday = isSameDay(day, new Date());
          return (
            <div key={key} className="min-h-[120px]">
              <div
                className={cn(
                  "px-3 py-2 text-xs uppercase tracking-wider font-semibold",
                  isToday ? "bg-accent/10 text-accent" : "bg-navy-50 text-navy-500"
                )}
              >
                {format(day, "EEE d MMM", { locale: fr })}
              </div>
              <div className="p-2 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-navy-400 px-1 py-2">—</p>
                ) : (
                  items.map((s) => {
                    const room = getRoomName?.(s.roomId);
                    const formateur = getFormateurName?.(s.formateurId);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSessionClick?.(s)}
                        className="w-full text-left rounded-lg border border-navy-100 bg-white hover:border-accent hover:shadow-soft transition-all p-2"
                      >
                        <p className="text-xs font-semibold text-navy-900 truncate">
                          {s.title}
                        </p>
                        <p className="mt-1 text-[11px] text-navy-500">
                          {format(new Date(s.start), "HH:mm")} –{" "}
                          {format(new Date(s.end), "HH:mm")}
                        </p>
                        {formateur && (
                          <p className="mt-0.5 text-[11px] text-navy-500 truncate">
                            {formateur}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          {room && (
                            <Badge tone="neutral" size="sm" className="text-[10px]">
                              <MapPin className="h-3 w-3" />
                              {room}
                            </Badge>
                          )}
                          {s.meetingUrl && (
                            <Badge tone="info" size="sm" className="text-[10px]">
                              <Video className="h-3 w-3" />
                              En ligne
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
