import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";
import {
  Sparkles, Settings, Search, CalendarCheck, MapPin,
  Tag, Users, Image as ImageIcon, LayoutGrid, Star,
} from "lucide-react";

const SECTIONS = [
  { id: "hero",             label: "Hero",           icon: Sparkles,     desc: "Заголовок, подзаголовок, кнопки" },
  { id: "settings",        label: "Настройки",       icon: Settings,     desc: "Контакты, соцсети, адрес" },
  { id: "seo",             label: "SEO",             icon: Search,       desc: "Мета-теги, описание" },
  { id: "booking",         label: "Форма записи",    icon: CalendarCheck, desc: "Тексты формы бронирования" },
  { id: "contacts",        label: "Контакты",        icon: MapPin,       desc: "Заголовок, карта" },
  { id: "promotions",      label: "Акции",           icon: Tag,          desc: "Список акций и скидок" },
  { id: "masters",         label: "Мастера",         icon: Users,        desc: "Профили мастеров" },
  { id: "gallery",         label: "Галерея",         icon: ImageIcon,    desc: "Фотографии работ" },
  { id: "serviceCategories", label: "Категории",     icon: LayoutGrid,   desc: "Категории услуг" },
];

function useSectionTimestamps() {
  return useQuery({
    queryKey: ["site_content_timestamps"],
    queryFn: async () => {
      if (!isSupabaseReady) return {};
      const { data } = await supabase
        .from("site_content")
        .select("id, updated_at");
      if (!data) return {};
      return Object.fromEntries(data.map((r) => [r.id, r.updated_at]));
    },
    staleTime: 30_000,
  });
}

const ContentAdmin = () => {
  const { data: timestamps = {} } = useSectionTimestamps();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Контент</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Управление текстами и изображениями всех секций сайта
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ id, label, icon: Icon, desc }) => {
          const ts = (timestamps as Record<string, string>)[id];
          return (
            <Link
              key={id}
              to={id}
              className="group flex flex-col gap-3 rounded-2xl border border-border/30 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <span className="rounded-full bg-surface-low px-2 py-0.5 text-[10px] text-muted-foreground">
                  {id}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </div>
              {ts && (
                <p className="text-[10px] text-muted-foreground/60">
                  Обновлено:{" "}
                  {new Intl.DateTimeFormat("ru", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  }).format(new Date(ts))}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContentAdmin;
