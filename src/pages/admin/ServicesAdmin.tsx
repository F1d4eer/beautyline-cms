import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { servicesData } from "@/data/siteData";
import type { ServiceRow } from "@/lib/supabase/types";
import { Loader2, Pencil, ToggleLeft, ToggleRight, X, Check, Plus, Trash2, RefreshCw, Images } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { isSupabaseReady } from "@/lib/supabase/client";
import ImageUploadField from "./components/ImageUploadField";
import { useQueryClient } from "@tanstack/react-query";

/** Safe UUID that works on http:// too */
const genId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const CATEGORY_LABELS: Record<string, string> = {
  lashes:   "Ресницы",
  nails:    "Руки",
  pedicure: "Ноги",
};

const inputCls =
  "w-full rounded-xl border border-border/20 bg-surface-low px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40";

type EditRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  old_price: number | null;
  price_prefix: string | null;
  discount: string | null;
  duration: string | null;
  image_url: string | null;
  images: string[];
  is_active: boolean;
  sort_order: number;
};

const BLANK: EditRow = {
  id:          "",
  name:        "",
  description: null,
  category:    "lashes",
  price:       0,
  old_price:   null,
  price_prefix: null,
  discount:    null,
  duration:    null,
  image_url:   null,
  images:      [],
  is_active:   true,
  sort_order:  0,
};

/** Small upload button that appends a new image URL */
const ExtraImageUpload = ({ onAdd }: { onAdd: (url: string) => void }) => {
  const { upload, uploading } = useImageUpload();
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={uploading || !isSupabaseReady}
        onClick={() => ref.current?.click()}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
      >
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
        {uploading ? "Загрузка..." : "Добавить фото"}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try { const url = await upload(file); onAdd(url); } catch {}
          e.target.value = "";
        }}
      />
    </>
  );
};

const ServicesAdmin = () => {
  const [rows, setRows]           = useState<ServiceRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<EditRow | null>(null);
  const [isNew, setIsNew]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const load = async () => {
    setLoading(true);
    setPageError(null);

    // Seed if empty (only if count=0 and no error reading)
    const { count, error: countErr } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true });

    if (countErr) {
      setPageError(countErr.message);
    } else if ((count ?? 0) === 0) {
      // Try seeding — don't block on failure
      const { error: seedErr } = await supabase.from("services").insert(
        servicesData.map((s, i) => ({
          id:          s.id,
          name:        s.name,
          description: s.description ?? null,
          category:    s.category,
          price:       s.price,
          old_price:   s.oldPrice ?? null,
          price_prefix: s.pricePrefix ?? null,
          discount:    s.discount ?? null,
          duration:    s.duration ?? null,
          image_url:   null,
          is_active:   s.isActive,
          sort_order:  i,
        }))
      );
      if (seedErr) {
        // Seed failed (likely uuid type issue) — show warning but don't block
        setPageError("Авто-заполнение не удалось: " + seedErr.message + ". Запустите supabase/migrate-safe.sql");
      }
    }

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order");
    if (error) setPageError(error.message);
    setRows((data as ServiceRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (row: ServiceRow) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) { setPageError(error.message); return; }
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, is_active: !r.is_active } : r));
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  const openCreate = () => {
    setModalError(null);
    setIsNew(true);
    setEditing({ ...BLANK, id: genId() });
  };

  const openEdit = (row: ServiceRow) => {
    setModalError(null);
    setIsNew(false);
    setEditing({
      id:          row.id,
      name:        row.name,
      description: row.description,
      category:    row.category,
      price:       row.price,
      old_price:   row.old_price,
      price_prefix: row.price_prefix,
      discount:    row.discount,
      duration:    row.duration,
      image_url:   row.image_url,
      images:      row.images ?? [],
      is_active:   row.is_active,
      sort_order:  row.sort_order,
    });
  };

  const closeModal = () => {
    setEditing(null);
    setIsNew(false);
    setModalError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      setModalError("Введите название услуги");
      return;
    }

    setSaving(true);
    setModalError(null);

    const payload = {
      name:        editing.name.trim(),
      description: editing.description?.trim() || null,
      category:    editing.category,
      price:       Math.max(0, Number(editing.price) || 0),
      old_price:   editing.old_price ? Math.max(0, Number(editing.old_price)) : null,
      price_prefix: editing.price_prefix?.trim() || null,
      discount:    editing.discount?.trim() || null,
      duration:    editing.duration?.trim() || null,
      image_url:   editing.image_url?.trim() || null,
      images:      editing.images.filter(Boolean),
    };

    if (isNew) {
      const { data: inserted, error } = await supabase
        .from("services")
        .insert({ id: editing.id, ...payload, is_active: editing.is_active, sort_order: rows.length })
        .select()
        .single();

      if (error) {
        setModalError("Ошибка: " + error.message);
        setSaving(false);
        return;
      }
      if (inserted) setRows((prev) => [...prev, inserted as ServiceRow]);
    } else {
      const { data: updated, error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();

      if (error) {
        setModalError("Ошибка: " + error.message);
        setSaving(false);
        return;
      }
      if (updated) setRows((prev) => prev.map((r) => r.id === editing.id ? (updated as ServiceRow) : r));
    }

    queryClient.invalidateQueries({ queryKey: ["services"] });
    setSaving(false);
    closeModal();
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Удалить услугу?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { setPageError(error.message); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground">Услуги</h1>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            title="Обновить"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus size={15} />
            Добавить
          </button>
        </div>
      </div>

      {pageError && (
        <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
          {pageError.includes("uuid") && (
            <div className="mt-1 text-xs opacity-80">
              Запустите <code className="font-mono">supabase/migrate-safe.sql</code> в Supabase SQL Editor,
              затем нажмите обновить.
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[1.5rem] bg-card py-16 text-center text-sm text-muted-foreground">
          Услуг нет — нажмите «Добавить»
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`flex items-center gap-4 rounded-[1.25rem] bg-card px-5 py-4 transition-opacity ${!row.is_active ? "opacity-50" : ""}`}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {row.image_url && (
                <img src={row.image_url} alt={row.name}
                  className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="label-text text-xs">{CATEGORY_LABELS[row.category] ?? row.category}</span>
                  {row.discount && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {row.discount}
                    </span>
                  )}
                </div>
                <p className="font-medium text-foreground truncate">{row.name}</p>
                <p className="text-sm text-muted-foreground">
                  {row.price_prefix ? `${row.price_prefix} ` : ""}
                  {row.price.toLocaleString("ru-RU")} ₽
                  {row.old_price != null && (
                    <span className="ml-2 line-through">{row.old_price.toLocaleString("ru-RU")} ₽</span>
                  )}
                  {row.duration && ` · ${row.duration}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => openEdit(row)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-surface-low hover:text-foreground"
                  title="Редактировать">
                  <Pencil size={16} />
                </button>
                <button onClick={() => toggleActive(row)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-surface-low hover:text-primary"
                  title={row.is_active ? "Скрыть" : "Показать"}>
                  {row.is_active ? <ToggleRight size={20} className="text-primary" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => deleteRow(row.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-surface-low hover:text-destructive"
                  title="Удалить">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-md rounded-[1.5rem] bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {isNew ? "Новая услуга" : "Редактировать услугу"}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Error shown INSIDE modal */}
            {modalError && (
              <div className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="label-text mb-1 block">Название *</label>
                <input className={inputCls} value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="label-text mb-1 block">Категория</label>
                <select className={inputCls} value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  <option value="lashes">Ресницы</option>
                  <option value="nails">Руки</option>
                  <option value="pedicure">Ноги</option>
                </select>
              </div>
              <div>
                <label className="label-text mb-1 block">Описание</label>
                <textarea className={`${inputCls} resize-none`} rows={2}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value || null })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text mb-1 block">Цена (₽) *</label>
                  <input type="number" className={inputCls} value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label-text mb-1 block">Старая цена</label>
                  <input type="number" className={inputCls} value={editing.old_price ?? ""}
                    onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text mb-1 block">Префикс цены</label>
                  <input className={inputCls} placeholder="от" value={editing.price_prefix ?? ""}
                    onChange={(e) => setEditing({ ...editing, price_prefix: e.target.value || null })} />
                </div>
                <div>
                  <label className="label-text mb-1 block">Длительность</label>
                  <input className={inputCls} placeholder="1ч 30м" value={editing.duration ?? ""}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value || null })} />
                </div>
              </div>
              <div>
                <label className="label-text mb-1 block">Скидка (текст)</label>
                <input className={inputCls} placeholder="-20%" value={editing.discount ?? ""}
                  onChange={(e) => setEditing({ ...editing, discount: e.target.value || null })} />
              </div>
              <div>
                <ImageUploadField label="Главное фото" value={editing.image_url ?? ""}
                  onChange={(url) => setEditing({ ...editing, image_url: url || null })} />
              </div>

              {/* Extra images */}
              <div>
                <label className="label-text mb-2 block flex items-center gap-1.5">
                  <Images size={13} />
                  Дополнительные фото
                </label>
                <div className="space-y-2">
                  {editing.images.map((img, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {img && <img src={img} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
                      <input
                        className={`${inputCls} flex-1`}
                        value={img}
                        placeholder="URL фото"
                        onChange={(e) => {
                          const next = [...editing.images];
                          next[i] = e.target.value;
                          setEditing({ ...editing, images: next });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <ExtraImageUpload
                    onAdd={(url) => setEditing({ ...editing, images: [...editing.images, url] })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={saveEdit} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {isNew ? "Создать" : "Сохранить"}
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

export default ServicesAdmin;
