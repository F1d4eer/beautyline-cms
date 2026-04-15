import { promotionsData, servicesData } from "@/data/siteData";
import { useContent } from "@/hooks/use-content";
import { PromotionsContent } from "@/lib/supabase/content-types";
import { Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const formatPromoDate = (iso: string | undefined) => {
  if (!iso || typeof iso !== "string" || !iso.includes("-")) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(
    new Date(y, m - 1, d)
  );
};

const Promotions = () => {
  const { openBooking } = useBooking();
  const { data } = useContent<PromotionsContent>("promotions", { items: promotionsData });
  const promos = Array.isArray(data?.items) ? data.items : [];

  if (promos.length === 0) return null;

  return (
    <section className="section-padding bg-background">
      <div className="mx-auto max-w-3xl space-y-4">
        {promos.map((promo) => {
          const promoService = promo.promoServiceId
            ? servicesData.find((s) => s.id === promo.promoServiceId) ?? null
            : null;

          const oldPrice =
            (promo as typeof promo & { originalPrice?: number }).originalPrice ??
            promoService?.price ??
            null;

          return (
            <div
              key={promo.id}
              className="relative overflow-hidden rounded-[2rem] bg-secondary/50"
            >
              {/* Optional promo image */}
              {promo.image && (
                <div className="h-44 w-full overflow-hidden sm:h-56">
                  <img src={promo.image} alt={promo.title} className="h-full w-full object-cover" />
                </div>
              )}

              <div className="p-6 sm:p-8 md:p-10">
                <Sparkles className="absolute top-5 right-5 text-primary/30" size={26} />
                <p className="label-text mb-2 text-primary">Акция — скидка {promo.discount}</p>
                <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl md:text-2xl leading-snug">
                  {promo.title}
                </h3>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {(promo.promoPrice ?? 0).toLocaleString("ru-RU")} ₽
                  </span>
                  {oldPrice != null && oldPrice > (promo.promoPrice ?? 0) && (
                    <span className="text-xl font-medium text-muted-foreground line-through">
                      {oldPrice.toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                  <span className="label-text self-center">до {formatPromoDate(promo.endsAt)}</span>
                </div>

                <button
                  onClick={() => openBooking(promoService)}
                  className="mt-6 inline-flex min-h-[44px] rounded-full bg-primary px-7 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-opacity duration-300 hover:opacity-90"
                >
                  Записаться по акции
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Promotions;
