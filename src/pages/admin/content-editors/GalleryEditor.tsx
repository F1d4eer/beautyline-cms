import { useEffect, useState } from "react";
import { useContent } from "@/hooks/use-content";
import { GalleryContent, GalleryItem } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import ImageUploadField from "../components/ImageUploadField";

const FALLBACK: GalleryContent = {
  items: [
    { id: "g1", image: "", alt: "Маникюр — работа студии",              category: "nails",    isActive: true },
    { id: "g2", image: "", alt: "Наращивание ресниц — работа студии",    category: "lashes",   isActive: true },
    { id: "g3", image: "", alt: "Педикюр — работа студии",               category: "pedicure", isActive: true },
    { id: "g4", image: "", alt: "Инструменты для наращивания ресниц",    category: "lashes",   isActive: true },
    { id: "g5", image: "", alt: "Дизайн ногтей — работа студии",         category: "nails",    isActive: true },
    { id: "g6", image: "", alt: "Френч маникюр — работа студии",         category: "nails",    isActive: true },
    { id: "g7", image: "", alt: "Яркий нейл-арт — работа студии",        category: "nails",    isActive: true },
    { id: "g8", image: "", alt: "Объёмное наращивание ресниц",            category: "lashes",   isActive: true },
    { id: "g9", image: "", alt: "Нюдовый маникюр — работа студии",       category: "nails",    isActive: true },
  ],
};

const CATEGORIES = [
  { key: "nails",    label: "Руки" },
  { key: "lashes",   label: "Ресницы" },
  { key: "pedicure", label: "Ноги" },
];

const GalleryEditor = () => {
  const { data, isLoading, save } = useContent<GalleryContent>("gallery", FALLBACK);
  const [items, setItems] = useState<GalleryItem[]>(FALLBACK.items);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sync local state once real data loads from DB
  useEffect(() => {
    if (!isLoading && !initialized) {
      setItems(data.items);
      setInitialized(true);
    }
  }, [isLoading, data.items, initialized]);

  const update = <K extends keyof GalleryItem>(idx: number, key: K, val: GalleryItem[K]) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const add = () => {
    const newItem: GalleryItem = {
      id:       `g-${Date.now()}`,
      image:    "",
      alt:      "Работа студии",
      category: "nails",
      isActive: true,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ items });
      toast({ title: "Галерея сохранена" });
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !initialized) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Неактивные фото скрыты на сайте. Нажмите «Сохранить» чтобы применить изменения.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`rounded-xl border bg-card p-3 space-y-2.5 ${
              item.isActive ? "border-border/30" : "border-border/20 opacity-60"
            }`}
          >
            <ImageUploadField
              label=""
              value={item.image}
              onChange={(url) => update(idx, "image", url)}
            />

            <Input
              value={item.alt}
              onChange={(e) => update(idx, "alt", e.target.value)}
              placeholder="Описание фото"
              className="h-8 text-xs"
            />

            <div className="flex items-center gap-2">
              <select
                value={item.category ?? ""}
                onChange={(e) => update(idx, "category", e.target.value)}
                className="h-8 flex-1 rounded-lg border border-border/40 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <button
                onClick={() => update(idx, "isActive", !item.isActive)}
                className={`rounded-lg p-1.5 transition-colors ${item.isActive ? "text-primary" : "text-muted-foreground"}`}
                title={item.isActive ? "Скрыть" : "Показать"}
              >
                {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => remove(idx)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={add}
          className="flex min-h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-border/30 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
        {saving ? "Сохранение..." : "Сохранить"}
      </Button>
    </div>
  );
};

export default GalleryEditor;
