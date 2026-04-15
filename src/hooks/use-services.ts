import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";
import { servicesData } from "@/data/siteData";
import type { Service } from "@/data/siteData";

function mapRow(row: { id: string; name: string; description: string | null; category: string; category_label: string | null; price: number; price_prefix: string | null; old_price: number | null; discount: string | null; duration: string | null; image_url: string | null; images: string[] | null; is_active: boolean; sort_order: number }): Service {
  const fallback = servicesData.find((s) => s.id === row.id);
  const primaryImage = row.image_url?.trim() ? row.image_url : (fallback?.image ?? "");
  const extraImages = (row.images ?? []).filter(Boolean);
  // Merge: primary image first, then any extra images (dedup)
  const allImages = [primaryImage, ...extraImages.filter((u) => u !== primaryImage)].filter(Boolean);
  return {
    id:            row.id,
    name:          row.name,
    description:   row.description ?? fallback?.description ?? "",
    category:      row.category as Service["category"],
    categoryLabel: row.category_label ?? fallback?.categoryLabel ?? row.category,
    price:         row.price,
    pricePrefix:   row.price_prefix ?? fallback?.pricePrefix,
    oldPrice:      row.old_price ?? undefined,
    discount:      row.discount ?? undefined,
    duration:      row.duration ?? fallback?.duration ?? "",
    image:         primaryImage,
    images:        allImages.length > 1 ? allImages : undefined,
    alt:           fallback?.alt ?? row.name,
    isActive:      row.is_active,
  };
}

export function useServices() {
  const queryClient = useQueryClient();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      if (!isSupabaseReady) return null;
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order");
      if (error || !data) return null;
      return data;
    },
    staleTime: 60_000,
  });

  // Fall back to hardcoded data when Supabase is unavailable or table is empty
  const services: Service[] = rows?.length
    ? rows.filter((r) => r.is_active).map(mapRow)
    : servicesData.filter((s) => s.isActive);

  const allServices: Service[] = rows?.length ? rows.map(mapRow) : servicesData;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["services"] });

  return { services, allServices, isLoading, refresh };
}
