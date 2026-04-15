import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { SeoContent } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FALLBACK: SeoContent = {
  title: "Beautyline Studio — Маникюр, Педикюр, Наращивание ресниц | Бронницы",
  description:
    "Студия красоты Beautyline Studio в Бронницах. Профессиональный маникюр, педикюр, наращивание ресниц. Рейтинг 5.0 ★ Запись онлайн.",
  keywords:
    "маникюр бронницы, педикюр бронницы, наращивание ресниц бронницы, студия красоты, beautyline studio",
  ogImage: "",
};

const SeoEditor = () => {
  const { data, save } = useContent<SeoContent>("seo", FALLBACK);
  const [form, setForm] = useState<SeoContent>(data);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: keyof SeoContent, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      toast({ title: "SEO сохранено" });
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Field label="Title (вкладка браузера)">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Description (мета-описание)">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-[10px] text-muted-foreground">{form.description.length} / 160 символов</p>
      </Field>
      <Field label="Keywords (через запятую)">
        <textarea
          value={form.keywords}
          onChange={(e) => set("keywords", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </Field>
      <Field label="OG Image URL (для соцсетей)">
        <Input
          value={form.ogImage}
          onChange={(e) => set("ogImage", e.target.value)}
          placeholder="https://..."
        />
      </Field>
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

export default SeoEditor;
