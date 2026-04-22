import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { servicesData, mastersData } from "@/data/siteData";
import type { BookingRow, BookingStatus } from "@/lib/supabase/types";
import { Loader2, RefreshCw, Pencil, Trash2, X, Check, Ban } from "lucide-react";

const STATUS_LABELS: Record<BookingStatus, string> = {
  new:       "Новая",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  blocked:   "Заблокировано",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  new:       "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
  blocked:   "bg-gray-200 text-gray-600",
};

/** Safe UUID polyfill */
const genId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

type EditState = {
  id: string;
  name: string;
  phone: string;
  service_id: string;
  master_id: string;
  date: string;
  time: string;
  comment: string;
  status: BookingStatus;
};

const BLANK_BLOCK: EditState = {
  id: "",
  name: "Заблокировано",
  phone: "—",
  service_id: "",
  master_id: "",
  date: "",
  time: "",
  comment: "",
  status: "blocked",
};

const inputCls =
  "w-full rounded-xl border border-border/20 bg-surface-low px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40";

const BookingsAdmin = () => {
  const [rows, setRows]       = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<BookingStatus | "all">("all");
  const [dbError, setDbError] = useState<string | null>(null);

  const [editing, setEditing]       = useState<EditState | null>(null);
  const [isBlock, setIsBlock]       = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const load = async () => {
    setLoading(true);
    setDbError(null);
    const q = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") q.eq("status", filter);
    const { data, error } = await q;
    if (error) setDbError(error.message);
    setRows((data as BookingRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { setDbError("Ошибка: " + error.message); return; }
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    setDbError(null);
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Удалить запись?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) { setDbError("Ошибка: " + error.message); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const openEdit = (row: BookingRow) => {
    setModalError(null);
    setIsBlock(false);
    setEditing({
      id:         row.id,
      name:       row.name,
      phone:      row.phone,
      service_id: row.service_id ?? "",
      master_id:  row.master_id ?? "",
      date:       row.date ?? "",
      time:       row.time?.slice(0, 5) ?? "",
      comment:    row.comment ?? "",
      status:     row.status,
    });
  };

  const openBlock = () => {
    setModalError(null);
    setIsBlock(true);
    setEditing({ ...BLANK_BLOCK, id: genId() });
  };

  const closeModal = () => {
    setEditing(null);
    setIsBlock(false);
    setModalError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (isBlock && (!editing.date || !editing.time)) {
      setModalError("Укажите дату и время для блокировки");
      return;
    }
    setSaving(true);
    setModalError(null);

    if (isBlock) {
      const { data: inserted, error } = await supabase
        .from("bookings")
        .insert({
          id:         editing.id,
          name:       "Заблокировано",
          phone:      "—",
          service_id: editing.service_id || null,
          master_id:  editing.master_id || null,
          date:       editing.date,
          time:       editing.time,
          comment:    editing.comment || null,
          status:     "blocked",
        })
        .select()
        .single();
      if (error) { setModalError("Ошибка: " + error.message); setSaving(false); return; }
      if (inserted) setRows((prev) => [inserted as BookingRow, ...prev]);
    } else {
      const { data: updated, error } = await supabase
        .from("bookings")
        .update({
          name:       editing.name,
          phone:      editing.phone,
          service_id: editing.service_id || null,
          master_id:  editing.master_id || null,
          date:       editing.date || null,
          time:       editing.time || null,
          comment:    editing.comment || null,
          status:     editing.status,
        })
        .eq("id", editing.id)
        .select()
        .single();
      if (error) { setModalError("Ошибка: " + error.message); setSaving(false); return; }
      if (updated) setRows((prev) => prev.map((r) => r.id === editing.id ? (updated as BookingRow) : r));
    }

    setSaving(false);
    closeModal();
  };

  const serviceName = (id: string | null) =>
    id ? (servicesData.find((s) => s.id === id)?.name ?? id) : "—";
  const masterName = (id: string | null) =>
    id ? (mastersData.find((m) => m.id === id)?.name ?? id) : "Любой";

  const filters: Array<BookingStatus | "all"> = ["all", "new", "confirmed", "cancelled", "blocked"];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground">Заявки</h1>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground min-h-[40px]"
            title="Обновить"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={openBlock}
            className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground min-h-[40px]"
          >
            <Ban size={14} />
            <span className="hidden sm:inline">Заблокировать слот</span>
            <span className="sm:hidden">Блок</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px] ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "Все" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {dbError && (
        <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Ошибка БД: {dbError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-[1.5rem] bg-card py-16 text-center text-sm text-muted-foreground">
          Заявок пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[1.25rem] bg-card p-5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status]}`}>
                      {STATUS_LABELS[row.status]}
                    </span>
                  </div>
                  {row.phone !== "—" && (
                    <a href={`tel:${row.phone}`} className="mt-0.5 block text-sm text-primary hover:underline">
                      {row.phone}
                    </a>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("ru-RU", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button onClick={() => openEdit(row)}
                    className="rounded-xl p-2.5 text-muted-foreground hover:bg-surface-low hover:text-foreground min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Редактировать">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteRow(row.id)}
                    className="rounded-xl p-2.5 text-muted-foreground hover:bg-surface-low hover:text-destructive min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Удалить">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                <div><p className="label-text">Услуга</p><p className="text-foreground">{serviceName(row.service_id)}</p></div>
                <div><p className="label-text">Мастер</p><p className="text-foreground">{masterName(row.master_id)}</p></div>
                <div><p className="label-text">Дата</p><p className="text-foreground">{row.date ?? "—"}</p></div>
                <div><p className="label-text">Время</p><p className="text-foreground">{row.time?.slice(0,5) ?? "—"}</p></div>
              </div>

              {row.comment && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Комментарий:</span> {row.comment}
                </p>
              )}

              {/* Status quick actions — skip for blocked */}
              {row.status !== "blocked" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["confirmed", "cancelled", "new"] as BookingStatus[])
                    .filter((s) => s !== row.status)
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(row.id, s)}
                        className="rounded-full border border-border/30 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        → {STATUS_LABELS[s]}
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit / Block modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-md rounded-[1.5rem] bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {isBlock ? "Заблокировать слот" : "Редактировать запись"}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              {!isBlock && (
                <>
                  <div>
                    <label className="label-text mb-1 block">Имя</label>
                    <input className={inputCls} value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-text mb-1 block">Телефон</label>
                    <input className={inputCls} value={editing.phone}
                      onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text mb-1 block">Дата</label>
                  <input type="date" className={inputCls} value={editing.date} min={today}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                </div>
                <div>
                  <label className="label-text mb-1 block">Время</label>
                  <input type="time" className={inputCls} value={editing.time}
                    onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label-text mb-1 block">Услуга</label>
                <select className={inputCls} value={editing.service_id}
                  onChange={(e) => setEditing({ ...editing, service_id: e.target.value })}>
                  <option value="">— не указана —</option>
                  {servicesData.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text mb-1 block">Мастер</label>
                <select className={inputCls} value={editing.master_id}
                  onChange={(e) => setEditing({ ...editing, master_id: e.target.value })}>
                  <option value="">Любой мастер</option>
                  {mastersData.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {!isBlock && (
                <div>
                  <label className="label-text mb-1 block">Статус</label>
                  <select className={inputCls} value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as BookingStatus })}>
                    {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label-text mb-1 block">Комментарий</label>
                <textarea className={`${inputCls} resize-none`} rows={2}
                  value={editing.comment}
                  onChange={(e) => setEditing({ ...editing, comment: e.target.value })} />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={saveEdit} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {isBlock ? "Заблокировать" : "Сохранить"}
              </button>
              <button onClick={closeModal}
                className="rounded-full bg-surface-container px-5 py-2.5 text-sm font-medium text-muted-foreground">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsAdmin;
