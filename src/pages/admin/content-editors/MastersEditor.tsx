import { useState } from "react";
import { useContent } from "@/hooks/use-content";
import { MastersContent, MasterItem } from "@/lib/supabase/content-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import ImageUploadField from "../components/ImageUploadField";
import { useAllMasterSchedules, MasterSchedule, DAY_NAMES, ALL_SLOTS } from "@/hooks/use-master-schedule";

const FALLBACK: MastersContent = {
  items: [
    {
      id: "m1", name: "Виктория", role: "Топ-мастер",
      image: "", rating: 5.0, reviewsCount: 27,
      specialties: ["Маникюр", "Педикюр"],
      serviceCategories: ["nails", "pedicure"],
    },
    {
      id: "m2", name: "Карина", role: "Мастер по наращиванию ресниц",
      image: "", rating: 5.0, reviewsCount: 6,
      specialties: ["Наращивание ресниц"],
      serviceCategories: ["lashes"],
    },
  ],
};

const CATEGORY_OPTIONS = [
  { key: "all", label: "Все" },
  { key: "lashes", label: "Ресницы" },
  { key: "nails", label: "Руки" },
  { key: "pedicure", label: "Ноги" },
];

const MastersEditor = () => {
  const { data, save } = useContent<MastersContent>("masters", FALLBACK);
  const [items, setItems] = useState<MasterItem[]>(data.items);
  const [open, setOpen] = useState<number | null>(0);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { schedules, saveSchedule } = useAllMasterSchedules();

  const getSchedule = (masterId: string): MasterSchedule =>
    schedules.find((s) => s.master_id === masterId) ?? {
      master_id: masterId,
      working_days: [1, 2, 3, 4, 5, 6],
      slots: ALL_SLOTS,
    };

  const [scheduleEdits, setScheduleEdits] = useState<Record<string, MasterSchedule>>({});
  const scheduleFor = (masterId: string) =>
    scheduleEdits[masterId] ?? getSchedule(masterId);

  const updateSchedule = (masterId: string, patch: Partial<MasterSchedule>) => {
    setScheduleEdits((prev) => ({
      ...prev,
      [masterId]: { ...scheduleFor(masterId), ...patch },
    }));
  };

  const update = <K extends keyof MasterItem>(idx: number, key: K, val: MasterItem[K]) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const toggleCategory = (idx: number, cat: string) => {
    const current = items[idx].serviceCategories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    update(idx, "serviceCategories", next);
  };

  const add = () => {
    const newMaster: MasterItem = {
      id: `m-${Date.now()}`,
      name: "Новый мастер",
      role: "",
      image: "",
      rating: 5.0,
      reviewsCount: 0,
      specialties: [],
      serviceCategories: [],
    };
    setItems((prev) => [...prev, newMaster]);
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
      // Save all edited schedules
      await Promise.all(Object.values(scheduleEdits).map((s) => saveSchedule(s)));
      setScheduleEdits({});
      toast({ title: "Мастера сохранены" });
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.map((master, idx) => (
        <div key={master.id} className="rounded-xl border border-border/30 bg-card overflow-hidden">
          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            {master.image && (
              <img src={master.image} alt="" className="h-8 w-8 rounded-full object-cover" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{master.name}</p>
              <p className="text-xs text-muted-foreground">{master.role}</p>
            </div>
            {open === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {open === idx && (
            <div className="border-t border-border/20 px-4 pb-4 pt-3 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Имя">
                  <Input value={master.name} onChange={(e) => update(idx, "name", e.target.value)} />
                </Field>
                <Field label="Должность / роль">
                  <Input value={master.role} onChange={(e) => update(idx, "role", e.target.value)} />
                </Field>
              </div>

              <ImageUploadField
                label="Фото мастера"
                value={master.image}
                onChange={(url) => update(idx, "image", url)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Рейтинг">
                  <Input type="number" min={1} max={5} step={0.1}
                    value={master.rating}
                    onChange={(e) => update(idx, "rating", parseFloat(e.target.value) || 5)}
                  />
                </Field>
                <Field label="Кол-во отзывов">
                  <Input type="number" min={0}
                    value={master.reviewsCount}
                    onChange={(e) => update(idx, "reviewsCount", parseInt(e.target.value) || 0)}
                  />
                </Field>
              </div>

              <Field label="Специализации (через запятую)">
                <Input
                  value={master.specialties.join(", ")}
                  onChange={(e) => update(idx, "specialties", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="Маникюр, Педикюр"
                />
              </Field>

              <Field label="Категории услуг">
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.filter((c) => c.key !== "all").map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => toggleCategory(idx, cat.key)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        master.serviceCategories.includes(cat.key)
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-low text-muted-foreground hover:bg-border/40"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Schedule */}
              <div className="rounded-xl border border-border/20 bg-surface-low p-3 space-y-3">
                <p className="text-sm font-medium text-foreground">График работы</p>

                {/* Working days */}
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Рабочие дни</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[0,1,2,3,4,5,6].map((day) => {
                      const sch = scheduleFor(master.id);
                      const active = sch.working_days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? sch.working_days.filter((d) => d !== day)
                              : [...sch.working_days, day].sort();
                            updateSchedule(master.id, { working_days: next });
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            active ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground hover:bg-border/40"
                          }`}
                        >
                          {DAY_NAMES[day]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Временные слоты</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_SLOTS.map((slot) => {
                      const sch = scheduleFor(master.id);
                      const active = sch.slots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? sch.slots.filter((s) => s !== slot)
                              : [...sch.slots, slot].sort();
                            updateSchedule(master.id, { slots: next });
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            active ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground hover:bg-border/40"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button onClick={() => remove(idx)} className="flex items-center gap-1.5 text-xs text-destructive hover:underline">
                <Trash2 size={13} />Удалить мастера
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1.5" />Добавить мастера
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

export default MastersEditor;
