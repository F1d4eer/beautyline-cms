import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { ServiceCategoriesContent, ServiceCategoryItem } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const FALLBACK: ServiceCategoriesContent = {
  items: [
    { key: "all",      label: "Все" },
    { key: "lashes",   label: "Ресницы" },
    { key: "nails",    label: "Руки" },
    { key: "pedicure", label: "Ноги" },
  ],
};

const ServiceCategoriesEditor = () => {
  const { data, save } = useContent<ServiceCategoriesContent>("serviceCategories", FALLBACK);
  const [items, setItems] = useState<ServiceCategoryItem[]>(data.items);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const update = (idx: number, field: keyof ServiceCategoryItem, val: string) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setItems(next);
  };

  const add = () =>
    setItems((prev) => [...prev, { key: `cat-${Date.now()}`, label: "Новая" }]);

  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ items });
      toast({ title: "Категории сохранены" });
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Первая категория обычно «Все» — она показывает все услуги.
      </p>

      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded-xl border border-border/30 bg-card p-3">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp size={13} /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown size={13} /></button>
            </div>
            <Input value={item.key} onChange={(e) => update(idx, "key", e.target.value)} placeholder="key (lashes)" className="h-9 w-32 font-mono text-xs" />
            <Input value={item.label} onChange={(e) => update(idx, "label", e.target.value)} placeholder="Название" className="h-9 flex-1" />
            <button onClick={() => remove(idx)} className="rounded p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1.5" />Добавить
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" />
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
};

export default ServiceCategoriesEditor;
