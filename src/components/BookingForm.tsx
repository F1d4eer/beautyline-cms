import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { servicesData, mastersData, siteSettings, bookingData } from "@/data/siteData";
import { Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";
import { sendBookingToTelegram, isTelegramReady } from "@/lib/telegram";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";
import { useOccupiedSlots } from "@/hooks/use-reviews";
import { useMasterSchedule, DAY_NAMES, ALL_SLOTS } from "@/hooks/use-master-schedule";

const PHONE_RE = /^(\+7|7|8)[\s\-()]?\d{3}[\s\-()]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;

const bookingSchema = z.object({
  name:    z.string().trim().min(2, "Введите имя").max(100),
  phone:   z.string().trim().min(1, "Введите телефон").regex(PHONE_RE, "Введите корректный номер"),
  service: z.string().min(1, "Выберите услугу"),
  master:  z.string().optional(),
  date:    z.string().min(1, "Выберите дату"),
  time:    z.string().min(1, "Выберите время"),
  comment: z.string().max(500).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// ─── date helpers ───────────────────────────────────────────────────
/** "YYYY-MM-DD" → Date at local midnight */
const parseLocal = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Date → "YYYY-MM-DD" */
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Short month name in Russian */
const MONTHS_RU = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

/** Build array of next `days` dates starting from today */
const buildDateRange = (days = 30): Date[] => {
  const arr: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    arr.push(d);
  }
  return arr;
};

// ─── DatePicker component ────────────────────────────────────────────
interface DatePickerProps {
  selected: string;
  workingDays: number[] | null; // null = all days allowed
  onSelect: (iso: string) => void;
  hasError: boolean;
}

const DatePicker = ({ selected, workingDays, onSelect, hasError }: DatePickerProps) => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Build 7-day window starting from (today + weekOffset*7)
  const allDates = useMemo(() => buildDateRange(60), []);

  const windowStart = weekOffset * 7;
  const windowDates = allDates.slice(windowStart, windowStart + 7);
  const canGoBack   = weekOffset > 0;
  const canGoFwd    = windowStart + 7 < allDates.length;

  // Month label for the current window
  const months = [...new Set(windowDates.map((d) => `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`))];
  const monthLabel = months.join(" / ");

  return (
    <div>
      {/* Week navigation header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium capitalize text-foreground">{monthLabel}</span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => setWeekOffset((w) => w - 1)}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-low disabled:opacity-30"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            disabled={!canGoFwd}
            onClick={() => setWeekOffset((w) => w + 1)}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-low disabled:opacity-30"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Day buttons */}
      <div className={`grid grid-cols-7 gap-1 ${hasError ? "ring-2 ring-destructive/40 rounded-xl p-1" : ""}`}>
        {windowDates.map((date) => {
          const iso       = toISO(date);
          const dayOfWeek = date.getDay(); // 0=Sun…6=Sat
          const isWorking = workingDays === null || workingDays.includes(dayOfWeek);
          const isSelected = selected === iso;
          const dayName   = DAY_NAMES[dayOfWeek];

          return (
            <button
              key={iso}
              type="button"
              disabled={!isWorking}
              onClick={() => isWorking && onSelect(iso)}
              className={`flex flex-col items-center rounded-xl py-2 text-center transition-colors
                ${isSelected
                  ? "bg-primary text-primary-foreground"
                  : isWorking
                  ? "bg-surface-high text-foreground hover:bg-primary/10 hover:text-primary"
                  : "cursor-not-allowed bg-surface-low/50 text-muted-foreground/30"
                }`}
            >
              <span className="text-[10px] font-medium leading-none">{dayName}</span>
              <span className="mt-1 text-sm font-semibold leading-none">{date.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main form ───────────────────────────────────────────────────────
interface BookingFormProps {
  preselectedServiceId?: string;
  onSuccess?: () => void;
}

const BookingForm = ({ preselectedServiceId, onSuccess }: BookingFormProps) => {
  const [form, setForm] = useState<BookingFormData>({
    name: "", phone: "",
    service: preselectedServiceId || "",
    master: "", date: "", time: "", comment: "",
  });
  const [errors, setErrors]         = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // Master schedule
  const { schedule } = useMasterSchedule(form.master || undefined);
  const occupiedSlots = useOccupiedSlots(form.date);

  // Working days: null when no master selected (all days allowed)
  const workingDays: number[] | null = form.master ? schedule.working_days : null;
  // Time slots: master's slots when master selected, otherwise all slots
  const availableSlots = form.master ? schedule.slots : ALL_SLOTS;

  const activeServices = servicesData.filter((s) => s.isActive);
  const selectedServiceCategory = servicesData.find((s) => s.id === form.service)?.category;
  const availableMasters = selectedServiceCategory
    ? mastersData.filter((m) => m.serviceCategories.includes(selectedServiceCategory))
    : mastersData;

  const setField = (field: keyof BookingFormData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleChange = (field: keyof BookingFormData, value: string) => {
    if (field === "service") {
      setForm((p) => ({ ...p, service: value, master: "", date: "", time: "" }));
      setErrors((p) => ({ ...p, service: undefined, master: undefined, date: undefined, time: undefined }));
      return;
    }
    if (field === "master") {
      // Reset date + time when master changes — their schedule may differ
      setForm((p) => ({ ...p, master: value, date: "", time: "" }));
      setErrors((p) => ({ ...p, master: undefined, date: undefined, time: undefined }));
      return;
    }
    setField(field, value);
  };

  const handleDateSelect = (iso: string) => {
    setForm((p) => ({ ...p, date: iso, time: "" }));
    setErrors((p) => ({ ...p, date: undefined, time: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = bookingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const f = err.path[0] as keyof BookingFormData;
        if (!fieldErrors[f]) fieldErrors[f] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const selectedService = servicesData.find((s) => s.id === form.service);
    const selectedMaster  = mastersData.find((m) => m.id === form.master);
    const payload = {
      name: form.name, phone: form.phone,
      serviceName: selectedService?.name || "Не указана",
      masterName:  selectedMaster?.name  || "Любой",
      date: form.date, time: form.time, comment: form.comment,
    };

    if (isSupabaseReady) {
      supabase.from("bookings").insert({
        name: form.name, phone: form.phone,
        service_id: form.service || null,
        master_id:  form.master  || null,
        date: form.date, time: form.time,
        comment: form.comment || null,
        status: "new",
      }).then(({ error }) => {
        if (error) console.error("[Booking] Supabase insert error:", error);
      });
    }

    const waMsg = encodeURIComponent(
      `Здравствуйте! Хочу записаться.\n\nИмя: ${form.name}\nТелефон: ${form.phone}\nУслуга: ${payload.serviceName}\nМастер: ${payload.masterName}\nДата: ${form.date}\nВремя: ${form.time}${form.comment ? `\nКомментарий: ${form.comment}` : ""}`
    );

    if (isTelegramReady) {
      sendBookingToTelegram(payload)
        .then(() => { setSubmitting(false); setSubmitted(true); })
        .catch(() => {
          window.open(`https://wa.me/${siteSettings.phoneRaw}?text=${waMsg}`, "_blank");
          setSubmitting(false); setSubmitted(true);
        });
    } else {
      setTimeout(() => {
        window.open(`https://wa.me/${siteSettings.phoneRaw}?text=${waMsg}`, "_blank");
        setSubmitting(false); setSubmitted(true);
      }, 350);
    }
  };

  const inputBase = "w-full rounded-xl bg-surface-high px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/30 min-h-[42px]";
  const cls = (field: keyof BookingFormData) =>
    `${inputBase}${errors[field] ? " ring-2 ring-destructive/50" : ""}`;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-6 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Check className="text-primary-foreground" size={22} />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{bookingData.successTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{bookingData.successMessage}</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: "", phone: "", service: preselectedServiceId || "", master: "", date: "", time: "", comment: "" });
            onSuccess?.();
          }}
          className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Закрыть
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Service */}
      {!preselectedServiceId && (
        <div>
          <label className="label-text mb-1.5 block text-xs">Услуга</label>
          <select value={form.service} onChange={(e) => handleChange("service", e.target.value)} className={cls("service")}>
            <option value="">Выберите услугу</option>
            {activeServices.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.price.toLocaleString("ru-RU")} ₽</option>
            ))}
          </select>
          <AnimatePresence>{errors.service && <ErrMsg msg={errors.service} />}</AnimatePresence>
        </div>
      )}

      {/* Master */}
      <div>
        <label className="label-text mb-1.5 block text-xs">Мастер</label>
        <select value={form.master} onChange={(e) => handleChange("master", e.target.value)} className={inputBase}>
          <option value="">Любой мастер</option>
          {availableMasters.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        {form.master && schedule.working_days.length > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Работает: {schedule.working_days.map((d) => DAY_NAMES[d]).join(", ")}
          </p>
        )}
      </div>

      {/* Name + Phone */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label-text mb-1.5 block text-xs">Ваше имя</label>
          <input type="text" placeholder="Мария" value={form.name} onChange={(e) => setField("name", e.target.value)} className={cls("name")} />
          <AnimatePresence>{errors.name && <ErrMsg msg={errors.name} />}</AnimatePresence>
        </div>
        <div>
          <label className="label-text mb-1.5 block text-xs">Телефон</label>
          <input type="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={cls("phone")} />
          <AnimatePresence>{errors.phone && <ErrMsg msg={errors.phone} />}</AnimatePresence>
        </div>
      </div>

      {/* Date — custom picker with disabled non-working days */}
      <div>
        <label className="label-text mb-1.5 block text-xs">
          Дата
          {form.master && workingDays && (
            <span className="ml-1 font-normal text-muted-foreground">
              (серые — нерабочие дни)
            </span>
          )}
        </label>
        <DatePicker
          selected={form.date}
          workingDays={workingDays}
          onSelect={handleDateSelect}
          hasError={!!errors.date}
        />
        <AnimatePresence>{errors.date && <ErrMsg msg={errors.date} />}</AnimatePresence>
      </div>

      {/* Time slots */}
      <div>
        <label className="label-text mb-1.5 block text-xs">Время</label>
        {!form.date ? (
          <p className="rounded-xl bg-surface-low px-3 py-2.5 text-xs text-muted-foreground">
            Сначала выберите дату
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {availableSlots.map((slot) => {
              const occupied = occupiedSlots.includes(slot);
              const selected = form.time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={occupied}
                  onClick={() => {
                    setForm((p) => ({ ...p, time: slot }));
                    setErrors((p) => ({ ...p, time: undefined }));
                  }}
                  className={`min-h-[34px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    occupied
                      ? "cursor-not-allowed bg-surface-low text-muted-foreground/30 line-through"
                      : selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-high text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}
        <AnimatePresence>{errors.time && <ErrMsg msg={errors.time} />}</AnimatePresence>
      </div>

      {/* Comment */}
      <div>
        <label className="label-text mb-1.5 block text-xs">Комментарий</label>
        <textarea
          placeholder="Пожелания (необязательно)"
          value={form.comment || ""}
          onChange={(e) => setField("comment", e.target.value)}
          rows={2}
          className={`${inputBase} resize-none`}
        />
      </div>

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={submitting ? {} : { scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 min-h-[48px]"
      >
        {submitting ? <><Loader2 size={15} className="animate-spin" /> Отправка...</> : "Забронировать"}
      </motion.button>

      <p className="text-center text-[11px] text-muted-foreground">{bookingData.privacyText}</p>
    </form>
  );
};

const ErrMsg = ({ msg }: { msg: string }) => (
  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 text-xs text-destructive">
    {msg}
  </motion.p>
);

export default BookingForm;
