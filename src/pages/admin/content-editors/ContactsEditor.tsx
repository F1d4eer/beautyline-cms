import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { ContactsContent } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FALLBACK: ContactsContent = {
  heading: "Местоположение",
  subtitle: "Мы ждём вас",
  mapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=38.2612%2C55.4267&z=16&pt=38.2612%2C55.4267%2Cpm2rdm",
};

const ContactsEditor = () => {
  const { data, save } = useContent<ContactsContent>("contacts", FALLBACK);
  const [form, setForm] = useState<ContactsContent>(data);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: keyof ContactsContent, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      toast({ title: "Контакты сохранены" });
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Field label="Заголовок секции">
        <Input value={form.heading} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Подзаголовок">
        <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </Field>
      <Field label="URL карты (Yandex/Google embed)">
        <Input
          value={form.mapEmbedUrl}
          onChange={(e) => set("mapEmbedUrl", e.target.value)}
          placeholder="https://yandex.ru/map-widget/..."
        />
      </Field>

      {form.mapEmbedUrl && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Предпросмотр карты:</p>
          <iframe
            src={form.mapEmbedUrl}
            className="h-48 w-full rounded-xl border border-border/30"
            allowFullScreen
          />
        </div>
      )}

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

export default ContactsEditor;
