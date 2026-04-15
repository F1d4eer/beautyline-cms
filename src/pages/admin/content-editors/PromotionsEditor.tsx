import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { PromotionsContent, PromotionItem } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { servicesData } from "@/data/siteData";
import ImageUploadField from "../components/ImageUploadField";

const FALLBACK: PromotionsContent = {
  items: [
    {
      id: "p1",
      title: "Маникюр с покрытием в один тон + педикюр с покрытием без стоп",
      discount: "75%",
      originalPrice: 2215,
      promoPrice: 539,
      endsAt: "2026-04-30",
      promoServiceId: "s11",
    },
  ],
};

const PromotionsEditor = () => {
  const { data, save } = useContent<PromotionsContent>("promotions", FALLBACK);
  const [items, setItems] = useState<PromotionItem[]>(data.items);
  const [open, setOpen] = useState<number | null>(0);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const update = <K extends keyof PromotionItem>(idx: number, key: K, val: PromotionItem[K]) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const add = () => {
    const newItem: PromotionItem = {
      id: `p-${Date.now()}`,
      title: "Новая акция",
      discount: "10%",
      promoPrice: 0,
      endsAt: "",
    };
    setItems((prev) => [...prev, newItem]);
    setOpen(items.length);
  };

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setOpen(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ items });
      toast({ title: "Акции сохранены" });
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="rounded-xl border border-border/30 bg-card overflow-hidden">
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <span className="truncate text-sm font-medium text-foreground">{item.title || "Без названия"}</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{item.discount}</span>
              {open === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </button>

          {open === idx && (
            <div className="border-t border-border/20 px-4 pb-4 pt-3 space-y-4">
              <Field label="Название акции">
                <textarea
                  value={item.title}
                  onChange={(e) => update(idx, "title", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Скидка">
                  <Input value={item.discount} onChange={(e) => update(idx, "discount", e.target.value)} placeholder="75%" />
                </Field>
                <Field label="Цена по акции (₽)">
                  <Input type="number" value={item.promoPrice} onChange={(e) => update(idx, "promoPrice", Number(e.target.value))} />
                </Field>
                <Field label="Старая цена (₽)">
                  <Input type="number" value={item.originalPrice ?? ""} onChange={(e) => update(idx, "originalPrice", Number(e.target.value) || undefined)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Действует до">
                  <Input type="date" value={item.endsAt} onChange={(e) => update(idx, "endsAt", e.target.value)} />
                </Field>
                <Field label="Услуга для записи">
                  <select
                    value={item.promoServiceId ?? ""}
                    onChange={(e) => update(idx, "promoServiceId", e.target.value || undefined)}
                    className="h-10 w-full rounded-xl border border-border/40 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">— без привязки —</option>
                    {servicesData.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <ImageUploadField
                label="Фото акции (необязательно)"
                value={item.image ?? ""}
                onChange={(url) => update(idx, "image", url || undefined)}
              />
              <button onClick={() => remove(idx)} className="flex items-center gap-1.5 text-xs text-destructive hover:underline">
                <Trash2 size={13} />Удалить акцию
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1.5" />Добавить акцию
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" />
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-foreground">{label}</label>
    {children}
  </div>
);

export default PromotionsEditor;
