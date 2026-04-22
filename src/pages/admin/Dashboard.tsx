import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { CalendarCheck, Star, Clock, CheckCircle } from "lucide-react";

interface Stats {
  bookingsNew: number;
  bookingsTotal: number;
  reviewsPending: number;
  reviewsTotal: number;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) => (
  <div
    className="rounded-[1.5rem] bg-card p-4 sm:p-6"
    style={{ boxShadow: "var(--shadow-card)" }}
  >
    <div className={`mb-3 inline-flex rounded-xl p-2 ${accent ? "bg-primary/10" : "bg-surface-low"}`}>
      <Icon size={18} className={accent ? "text-primary" : "text-muted-foreground"} />
    </div>
    <p className="text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
    <p className="mt-1 text-xs font-medium text-foreground sm:text-sm">{label}</p>
    {sub && <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [b1, b2, r1, r2] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact" }).eq("status", "new"),
        supabase.from("bookings").select("id", { count: "exact" }),
        supabase.from("reviews").select("id", { count: "exact" }).eq("is_active", false),
        supabase.from("reviews").select("id", { count: "exact" }),
      ]);
      setStats({
        bookingsNew:    b1.count ?? 0,
        bookingsTotal:  b2.count ?? 0,
        reviewsPending: r1.count ?? 0,
        reviewsTotal:   r2.count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">Дашборд</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Clock}         label="Новых заявок"    value={stats!.bookingsNew}    accent />
          <StatCard icon={CalendarCheck} label="Всего заявок"    value={stats!.bookingsTotal}  sub="за всё время" />
          <StatCard icon={Star}          label="Ждут публикации" value={stats!.reviewsPending} accent={stats!.reviewsPending > 0} />
          <StatCard icon={CheckCircle}   label="Всего отзывов"   value={stats!.reviewsTotal}   sub="в базе" />
        </div>
      )}

      <div className="mt-8 rounded-[1.5rem] bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="font-display mb-3 text-base font-semibold text-foreground">Быстрые ссылки</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/bookings", label: "Посмотреть заявки" },
            { href: "/admin/reviews",  label: "Модерировать отзывы" },
            { href: "/admin/services", label: "Редактировать услуги" },
            { href: "/",              label: "Открыть сайт ↗", blank: true },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.blank ? "_blank" : undefined}
              rel={l.blank ? "noopener noreferrer" : undefined}
              className="rounded-full bg-surface-low px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary min-h-[40px] inline-flex items-center"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
