import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";

export function resolveImage(
  storageUrl: string | undefined,
  localFallback: string
): string {
  return storageUrl?.trim() ? storageUrl : localFallback;
}

export function useContent<T extends object>(
  sectionId: string,
  fallback: T
): { data: T; isLoading: boolean; save: (patch: T) => Promise<void> } {
  const queryClient = useQueryClient();

  const { data: raw, isLoading } = useQuery({
    queryKey: ["site_content", sectionId],
    queryFn: async () => {
      if (!isSupabaseReady) return null;
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", sectionId)
        .single();
      if (error) return null;
      return data?.content ?? null;
    },
    staleTime: 60_000,
  });

  const data: T =
    raw != null ? { ...fallback, ...(raw as Partial<T>) } : fallback;

  const save = async (patch: T) => {
    if (!isSupabaseReady) return;
    await supabase.from("site_content").upsert({
      id: sectionId,
      content: patch as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ["site_content", sectionId] });
  };

  return { data, isLoading, save };
}

export function useNavigationItems() {
  const queryClient = useQueryClient();

  const fallback = [
    { id: 1, label: "Услуги",   href: "#services", sort_order: 0 },
    { id: 2, label: "Работы",   href: "#gallery",  sort_order: 1 },
    { id: 3, label: "Отзывы",   href: "#reviews",  sort_order: 2 },
    { id: 4, label: "Контакты", href: "#contacts", sort_order: 3 },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["navigation_items"],
    queryFn: async () => {
      if (!isSupabaseReady) return fallback;
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .order("sort_order");
      if (error || !data?.length) return fallback;
      return data;
    },
    staleTime: 60_000,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["navigation_items"] });

  return { items: data ?? fallback, isLoading, refresh };
}
