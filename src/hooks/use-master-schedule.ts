import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";

export interface MasterSchedule {
  master_id: string;
  working_days: number[]; // 0=Sun, 1=Mon ... 6=Sat
  slots: string[];        // ["10:00", "11:00", ...]
}

const DEFAULT_SLOTS = [
  "10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30",
  "19:00","19:30","20:00",
];

export const ALL_SLOTS = DEFAULT_SLOTS;

/** Returns schedule for one master. Falls back to default if not in DB. */
export function useMasterSchedule(masterId: string | undefined) {
  const { data, isLoading } = useQuery<MasterSchedule | null>({
    queryKey: ["master_schedule", masterId],
    queryFn: async () => {
      if (!masterId || !isSupabaseReady) return null;
      const { data, error } = await supabase
        .from("master_schedules")
        .select("*")
        .eq("master_id", masterId)
        .single();
      if (error || !data) return null;
      return data as MasterSchedule;
    },
    enabled: !!masterId,
    staleTime: 60_000,
  });

  const schedule: MasterSchedule = data ?? {
    master_id: masterId ?? "",
    working_days: [1, 2, 3, 4, 5, 6],
    slots: DEFAULT_SLOTS,
  };

  return { schedule, isLoading };
}

/** All schedules — for admin page. */
export function useAllMasterSchedules() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<MasterSchedule[]>({
    queryKey: ["master_schedules"],
    queryFn: async () => {
      if (!isSupabaseReady) return [];
      const { data, error } = await supabase.from("master_schedules").select("*");
      if (error || !data) return [];
      return data as MasterSchedule[];
    },
    staleTime: 60_000,
  });

  const saveSchedule = async (schedule: MasterSchedule) => {
    if (!isSupabaseReady) return;
    await supabase.from("master_schedules").upsert({
      ...schedule,
      updated_at: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ["master_schedules"] });
    queryClient.invalidateQueries({ queryKey: ["master_schedule", schedule.master_id] });
  };

  return { schedules: data ?? [], isLoading, saveSchedule };
}

/** Human-readable day names (Mon-first). */
export const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
export const DAY_NAMES_FULL = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

/** Returns true if the given date string is a working day for this master. */
export function isWorkingDay(dateStr: string, workingDays: number[]): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  return workingDays.includes(d.getDay());
}
