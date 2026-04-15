import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { HeroContent } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import ImageUploadField from "../components/ImageUploadField";

const FALLBACK: HeroContent = {
  heading: "Искусство\nТочности",
  subheading:
    "Создаём идеальный образ через авторское видение и безупречную технику. Ваше пространство уникальной эстетики.",
  badge: "EST. 2023",
  ctaText: "Записаться",
  ctaSecondaryText: "Каталог услуг",
  image: "",
};

const HeroEditor = () => {
  const { data, save } = useContent<HeroContent>("hero", FALLBACK);
  const [form, setForm] = useState<HeroContent>(data);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: keyof HeroContent, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      toast({ title: "Hero сохранён" });
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Field label="Заголовок (\\n = перенос строки)">
        <textarea
          value={form.heading}
          onChange={(e) => set("heading", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </Field>
      <Field label="Подзаголовок">
        <textarea
          value={form.subheading}
          onChange={(e) => set("subheading", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </Field>
      <Field label="Бейдж (напр. EST. 2023)">
        <Input value={form.badge} onChange={(e) => set("badge", e.target.value)} className="w-48" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Кнопка 1 (главная)">
          <Input value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
        </Field>
        <Field label="Кнопка 2">
          <Input value={form.ctaSecondaryText} onChange={(e) => set("ctaSecondaryText", e.target.value)} />
        </Field>
      </div>
      <ImageUploadField
        label="Фоновое изображение"
        value={form.image}
        onChange={(url) => set("image", url)}
      />
      <Button onClick={handleSave} disabled={saving}>
        <Save size={16} className="mr-2" />
        {saving ? "Сохранение..." : "Сохранить"}
      </Button>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-foreground">{label}</label>
    {children}
  </div>
);

export default HeroEditor;
