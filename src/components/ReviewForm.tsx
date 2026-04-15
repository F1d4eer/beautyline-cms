import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Star, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewForm = ({ open, onOpenChange }: ReviewFormProps) => {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset form each time dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setText("");
      setRating(5);
      setHoverRating(0);
      setContact("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitting(true);

    if (isSupabaseReady) {
      const { error } = await supabase.from("reviews").insert({
        name: name.trim(),
        text: text.trim(),
        rating,
        contact: contact.trim() || null,
        is_active: false,
      });
      if (error) console.error("[Review] Supabase insert error:", error);
    }

    setSubmitting(false);
    onOpenChange(false);
    toast.success("Отзыв отправлен!", {
      description: "Спасибо! Он появится на сайте после проверки.",
    });
  };

  const inputCls =
    "w-full rounded-xl border border-border/20 bg-surface-low px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/40";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[1.5rem] border-none bg-card p-8">
        <VisuallyHidden>
          <DialogTitle>Оставить отзыв</DialogTitle>
        </VisuallyHidden>
        <h3 className="font-display text-xl font-semibold text-foreground mb-6">
          Оставить отзыв
        </h3>

        {/* Moderation notice */}
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-surface-low px-4 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Отзыв будет опубликован после проверки. Обычно это занимает до 24 часов.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="label-text mb-2 block">Оценка</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform duration-150 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Star
                    size={28}
                    className={
                      star <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label-text mb-2 block">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="Ваше имя"
              className={inputCls}
            />
          </div>

          {/* Review text */}
          <div>
            <label className="label-text mb-2 block">Отзыв</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              maxLength={1000}
              rows={4}
              placeholder="Расскажите о вашем опыте..."
              className={`${inputCls} resize-none`}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground/50">
              {text.length} / 1000
            </p>
          </div>

          {/* Contact (optional) */}
          <div>
            <label className="label-text mb-2 block">
              Телефон или email{" "}
              <span className="text-muted-foreground/50">(необязательно)</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={255}
              placeholder="+7 (___) ___-__-__ или email"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 min-h-[52px]"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Отправка...
              </>
            ) : (
              "Отправить отзыв"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
