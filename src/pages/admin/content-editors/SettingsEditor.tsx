import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { SiteSettingsContent } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FALLBACK: SiteSettingsContent = {
  studioName: "Beautyline Studio",
  tagline: "Студия мастера маникюра, педикюра и наращивания ресниц",
  phone: "+7 (925) 963-52-27",
  phoneRaw: "79259635227",
  whatsapp: "https://wa.me/79259635227",
  telegram: "https://t.me/beautylinestudio",
  email: "beautyline.studio@mail.ru",
  address: "г. Бронницы, Гаражный проезд, 1, Кабинет 2",
  workingHours: "Ежедневно 10:00 — 21:00",
  rating: 5.0,
  reviewsCount: 34,
};

const SettingsEditor = () => {
  const { data, save } = useContent<SiteSettingsContent>("settings", FALLBACK);
  const [form, setForm] = useState<SiteSettingsContent>(data);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: keyof SiteSettingsContent, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      toast({ title: "Настройки сохранены" });
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Общее">
        <Field label="Название студии">
          <Input value={form.studioName} onChange={(e) => set("studioName", e.target.value)} />
        </Field>
        <Field label="Слоган">
          <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
      </Section>

      <Section title="Контакты">
        <Field label="Телефон (отображаемый)">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+7 (___) ___-__-__" />
        </Field>
        <Field label="Телефон (только цифры, для ссылки tel:)">
          <Input value={form.phoneRaw} onChange={(e) => set("phoneRaw", e.target.value)} placeholder="79251234567" />
        </Field>
        <Field label="Email">
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" />
        </Field>
        <Field label="Адрес">
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="Режим работы">
          <Input value={form.workingHours} onChange={(e) => set("workingHours", e.target.value)} />
        </Field>
      </Section>

      <Section title="Социальные сети">
        <Field label="WhatsApp (полная ссылка)">
          <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="https://wa.me/79251234567" />
        </Field>
        <Field label="Telegram (полная ссылка)">
          <Input value={form.telegram} onChange={(e) => set("telegram", e.target.value)} placeholder="https://t.me/..." />
        </Field>
      </Section>

      <Section title="Рейтинг">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Рейтинг (1–5)">
            <Input
              type="number" min={1} max={5} step={0.1}
              value={form.rating}
              onChange={(e) => set("rating", parseFloat(e.target.value) || 5)}
            />
          </Field>
          <Field label="Количество оценок">
            <Input
              type="number" min={0}
              value={form.reviewsCount}
              onChange={(e) => set("reviewsCount", parseInt(e.target.value) || 0)}
            />
          </Field>
        </div>
      </Section>

      <Button onClick={handleSave} disabled={saving}>
        <Save size={16} className="mr-2" />
        {saving ? "Сохранение..." : "Сохранить"}
      </Button>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-foreground">{label}</label>
    {children}
  </div>
);

export default SettingsEditor;
