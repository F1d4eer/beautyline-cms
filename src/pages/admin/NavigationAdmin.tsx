import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";
import { NavigationItemRow } from "@/lib/supabase/types";
import { ArrowUp, ArrowDown, Trash2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_NAV: Array<Omit<NavigationItemRow, "id">> = [
  { label: "Услуги",   href: "#services", sort_order: 0 },
  { label: "Работы",   href: "#gallery",  sort_order: 1 },
  { label: "Отзывы",   href: "#reviews",  sort_order: 2 },
  { label: "Контакты", href: "#contacts", sort_order: 3 },
];

const NavigationAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading } = useQuery<NavigationItemRow[]>({
    queryKey: ["navigation_items_admin"],
    queryFn: async () => {
      if (!isSupabaseReady) return [];
      const { data } = await supabase
        .from("navigation_items")
        .select("*")
        .order("sort_order");
      return data ?? [];
    },
  });

  const [local, setLocal] = useState<NavigationItemRow[] | null>(null);

  // If DB is empty after loading, pre-fill with defaults so user can save them.
  useEffect(() => {
    if (!isLoading && items.length === 0 && local === null) {
      setLocal(
        DEFAULT_NAV.map((n, i) => ({ id: Date.now() + i, ...n }))
      );
    }
  }, [isLoading, items.length, local]);

  const rows = local ?? items;

  const update = (idx: number, field: "label" | "href", value: string) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    setLocal(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...rows];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setLocal(next.map((r, i) => ({ ...r, sort_order: i })));
  };

  const remove = (idx: number) => {
    setLocal(rows.filter((_, i) => i !== idx));
  };

  const add = () => {
    const newItem: NavigationItemRow = {
      id: Date.now(),
      label: "Новый пункт",
      href: "#",
      sort_order: rows.length,
    };
    setLocal([...rows, newItem]);
  };

  const save = async () => {
    if (!isSupabaseReady) {
      toast({ title: "Supabase не настроен", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Delete all and re-insert with new sort_order
      await supabase.from("navigation_items").delete().neq("id", 0);
      const inserts = rows.map(({ label, href, sort_order }) => ({
        label, href, sort_order,
      }));
      const { error } = await supabase.from("navigation_items").insert(inserts);
      if (error) throw error;
      setLocal(null);
      queryClient.invalidateQueries({ queryKey: ["navigation_items"] });
      queryClient.invalidateQueries({ queryKey: ["navigation_items_admin"] });
      toast({ title: "Навигация сохранена" });
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Загрузка...</p>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Навигация</h1>
          <p className="mt-1 text-sm text-muted-foreground">Пункты меню в шапке сайта</p>
        </div>
        <Button onClick={save} disabled={saving || !local}>
          <Save size={16} className="mr-2" />
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      {!isSupabaseReady && (
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          Supabase не подключён. Изменения не будут сохранены.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-xl border border-border/30 bg-card p-3"
          >
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === rows.length - 1}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            <Input
              value={item.label}
              onChange={(e) => update(idx, "label", e.target.value)}
              className="h-9 w-32"
              placeholder="Название"
            />
            <Input
              value={item.href}
              onChange={(e) => update(idx, "href", e.target.value)}
              className="h-9 flex-1"
              placeholder="#section"
            />
            <button
              onClick={() => remove(idx)}
              className="rounded p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="mt-4" onClick={add}>
        <Plus size={15} className="mr-1.5" />
        Добавить пункт
      </Button>
    </div>
  );
};

export default NavigationAdmin;
