import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { BookingContent } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FALLBACK: BookingContent = {
  heading: "Записаться на приём",
  subtitle: "Выберите услугу и удобное время — мы свяжемся с вами для подтверждения",
  privacyText: "Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных",
  successTitle: "Заявка отправлена!",
  successMessage: "Мы свяжемся с вами в ближайшее время для подтверждения записи.",
};

const BookingEditor = () => {
  const { data, save } = useContent<BookingContent>("booking", FALLBACK);
  const [form, setForm] = useState<BookingContent>(data);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: keyof BookingContent, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      toast({ title: "Форма записи сохранена" });
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
      <Field label="Текст согласия на обработку данных">
        <textarea
          value={form.privacyText}
          onChange={(e) => set("privacyText", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </Field>
      <Field label="Заголовок успешной отправки">
        <Input value={form.successTitle} onChange={(e) => set("successTitle", e.target.value)} />
      </Field>
      <Field label="Сообщение после отправки">
        <textarea
          value={form.successMessage}
          onChange={(e) => set("successMessage", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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

export default BookingEditor;
