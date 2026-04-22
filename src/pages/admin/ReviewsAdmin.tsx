import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { servicesData, mastersData } from "@/data/siteData";
import type { ReviewRow } from "@/lib/supabase/types";
import { Loader2, Eye, EyeOff, MessageSquare, RefreshCw } from "lucide-react";

const ReviewsAdmin = () => {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "published">("pending");
  const [dbError, setDbError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setDbError(null);
    const q = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (filter === "pending")   q.eq("is_active", false);
    if (filter === "published") q.eq("is_active", true);
    const { data, error } = await q;
    if (error) setDbError(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const refetch = () => load();

  const toggleActive = async (row: ReviewRow) => {
    const { error } = await supabase.from("reviews").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) {
      setDbError("Ошибка: " + error.message);
      return;
    }
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, is_active: !r.is_active } : r));
    setDbError(null);
    refetch();
  };

  const saveReply = async (id: string) => {
    const { error } = await supabase.from("reviews").update({ reply: replyText || null }).eq("id", id);
    if (error) {
      setDbError("Ошибка при сохранении ответа: " + error.message);
      return;
    }
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, reply: replyText || null } : r));
    setReplyId(null);
    setReplyText("");
    setDbError(null);
  };

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground">Отзывы</h1>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw size={14} />
          Обновить
        </button>
      </div>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {(["pending", "published", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px] ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground hover:text-foreground"
            }`}
          >
            {{ pending: "На проверке", published: "Опубликованные", all: "Все" }[f]}
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
          Отзывов нет
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[1.25rem] bg-card p-5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <span className="text-sm text-amber-500">{stars(row.rating)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.is_active ? "bg-green-100 text-green-800" : "bg-surface-container text-muted-foreground"
                    }`}>
                      {row.is_active ? "Опубликован" : "Скрыт"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("ru-RU")}
                    {row.service_id && ` · ${servicesData.find((s) => s.id === row.service_id)?.name ?? row.service_id}`}
                    {row.master_id  && ` · ${mastersData.find((m) => m.id === row.master_id)?.name  ?? row.master_id}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleActive(row)}
                    className="flex items-center gap-1.5 rounded-full border border-border/30 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary min-h-[36px]"
                  >
                    {row.is_active ? <><EyeOff size={13} /> Скрыть</> : <><Eye size={13} /> Опубликовать</>}
                  </button>
                  <button
                    onClick={() => { setReplyId(row.id); setReplyText(row.reply ?? ""); }}
                    className="flex items-center gap-1.5 rounded-full border border-border/30 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary min-h-[36px]"
                  >
                    <MessageSquare size={13} />
                    {row.reply ? "Изм. ответ" : "Ответить"}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground">{row.text}</p>

              {row.contact && (
                <p className="mt-1 text-xs text-muted-foreground">Контакт: {row.contact}</p>
              )}

              {row.reply && replyId !== row.id && (
                <div className="mt-3 rounded-xl bg-surface-low px-4 py-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Ответ:</span> {row.reply}
                </div>
              )}

              {replyId === row.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Текст ответа..."
                    className="w-full resize-none rounded-xl border border-border/20 bg-surface-low px-4 py-2 text-sm outline-none focus:border-primary/40"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveReply(row.id)}
                      className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => { setReplyId(null); setReplyText(""); }}
                      className="rounded-full bg-surface-container px-4 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsAdmin;
