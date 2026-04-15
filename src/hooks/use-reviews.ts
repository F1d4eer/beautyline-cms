import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";
import { reviewsData, siteSettings } from "@/data/siteData";

export interface DisplayReview {
  id: string;
  name: string;
  text: string;
  rating: number;
  masterId?: string;
  serviceId?: string;
  date?: string;
  reply?: string;
}

/** Active reviews from Supabase (is_active=true), fallback to siteData */
export function useActiveReviews() {
  const { data } = useQuery<DisplayReview[] | null>({
    queryKey: ["reviews", "active"],
    queryFn: async () => {
      if (!isSupabaseReady) return null;
      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, text, rating, master_id, service_id, date, reply")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error || !data) return null;
      return data.map((r) => ({
        id:        r.id,
        name:      r.name,
        text:      r.text,
        rating:    r.rating,
        masterId:  r.master_id  ?? undefined,
        serviceId: r.service_id ?? undefined,
        date:      r.date       ?? undefined,
        reply:     r.reply      ?? undefined,
      }));
    },
    staleTime: 30_000,
  });

  const fallback: DisplayReview[] = reviewsData
    .filter((r) => r.isActive)
    .map((r) => ({
      id: r.id, name: r.name, text: r.text, rating: r.rating,
      masterId: r.masterId, serviceId: r.serviceId, date: r.date, reply: r.reply,
    }));

  return { reviews: data && data.length > 0 ? data : fallback };
}

/** Count and average rating of published reviews — auto-calculated from DB */
export function useReviewStats() {
  const { data } = useQuery({
    queryKey: ["reviews", "stats"],
    queryFn: async () => {
      if (!isSupabaseReady) return null;
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("is_active", true);
      if (error || !data || data.length === 0) return null;
      const count = data.length;
      const avg = data.reduce((sum, r) => sum + (r.rating as number), 0) / count;
      return { count, avgRating: Math.round(avg * 10) / 10 };
    },
    staleTime: 30_000,
  });

  return {
    count:     data?.count     ?? siteSettings.reviewsCount,
    avgRating: data?.avgRating ?? siteSettings.rating,
  };
}

/** Occupied time slots for a given date (status != cancelled) */
export function useOccupiedSlots(date: string) {
  const { data } = useQuery<string[]>({
    queryKey: ["bookings", "slots", date],
    queryFn: async () => {
      if (!date || !isSupabaseReady) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("time")
        .eq("date", date)
        .neq("status", "cancelled");
      if (error || !data) return [];
      return data.map((r) => (r.time as string)?.slice(0, 5)).filter(Boolean);
    },
    enabled: !!date,
    staleTime: 10_000,
  });

  return data ?? [];
}
