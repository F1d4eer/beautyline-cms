import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from "framer-motion";
import BookingForm from "./BookingForm";
import type { Service } from "@/data/siteData";
import { promotionsData } from "@/data/siteData";
import { useContent } from "@/hooks/use-content";
import { PromotionsContent } from "@/lib/supabase/content-types";
import { Clock, X } from "lucide-react";
import { SwipeSlider } from "./SwipeSlider";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedService?: Service | null;
}

const formatPrice = (price: number, prefix?: string) =>
  prefix ? `${prefix} ${price.toLocaleString("ru-RU")} ₽` : `${price.toLocaleString("ru-RU")} ₽`;

// ─── Body scroll lock ──────────────────────────────────────────────────
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

// ─── Main component ────────────────────────────────────────────────────
const BookingDialog = ({ open, onOpenChange, preselectedService }: BookingDialogProps) => {
  useScrollLock(open);

  const { data: promosData } = useContent<PromotionsContent>("promotions", { items: promotionsData });
  const activePromo = preselectedService
    ? (promosData?.items ?? promotionsData).find(
        (p) => p.promoServiceId === preselectedService.id && p.promoPrice > 0
      ) ?? null
    : null;

  const serviceImages: string[] = preselectedService
    ? [
        ...(preselectedService.images ?? []),
        ...(preselectedService.image &&
        !(preselectedService.images ?? []).includes(preselectedService.image)
          ? [preselectedService.image]
          : []),
      ].filter(Boolean)
    : [];

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Drag-to-close
  const dragControls = useDragControls();
  const sheetY = useMotionValue(0);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 110 || info.velocity.y > 500) {
      close();
    } else {
      animate(sheetY, 0, { type: "spring", stiffness: 400, damping: 35 });
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  const content = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onPointerDown={close}
          />

          {/* Sheet — mobile: slides from bottom; desktop: scales in */}
          <motion.div
            className="relative z-10 flex w-full flex-col overflow-hidden bg-card
              rounded-t-[1.5rem]
              max-h-[92dvh]
              sm:max-h-[88vh] sm:max-w-2xl sm:rounded-[1.5rem] md:max-w-3xl"
            style={{ y: sheetY }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={handleDragEnd}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.9 }}
            // Prevent overlay pointer-down from propagating into sheet
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* ── Drag handle (touch target for pull-down) ── */}
            <div
              className="flex shrink-0 cursor-grab touch-none select-none items-center justify-center pb-2 pt-3 sm:hidden"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="h-1 w-10 rounded-full bg-border/60" />
            </div>

            {/* ── Header bar with title + close ── */}
            <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-1 sm:px-5 sm:pt-4">
              <h2 className="font-display text-base font-semibold text-foreground sm:text-lg">
                {preselectedService ? preselectedService.name : "Записаться на приём"}
              </h2>
              <button
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-low text-muted-foreground transition-colors hover:bg-border/50 hover:text-foreground"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Body: layout changes desktop vs mobile ── */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">

              {/* Image panel (desktop: left column) */}
              {serviceImages.length > 0 && (
                <div className="relative hidden md:block md:w-2/5 md:shrink-0 overflow-hidden">
                  <SwipeSlider images={serviceImages} alt={preselectedService?.alt ?? ""} className="h-full" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <ServiceInfoOverlay
                    service={preselectedService!}
                    activePromo={activePromo}
                  />
                </div>
              )}

              {/* Mobile image banner */}
              {serviceImages.length > 0 && (
                <div className="relative shrink-0 md:hidden" style={{ height: "44vw", maxHeight: 200, minHeight: 140 }}>
                  <SwipeSlider images={serviceImages} alt={preselectedService?.alt ?? ""} className="h-full" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <PriceRow service={preselectedService!} activePromo={activePromo} mobile />
                  </div>
                </div>
              )}

              {/* No-image compact info bar on mobile */}
              {serviceImages.length === 0 && preselectedService && (
                <div className="shrink-0 bg-surface-low px-4 py-2.5 md:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <p className="label-text text-xs">{preselectedService.categoryLabel}</p>
                    <span className="text-sm font-bold text-foreground">
                      {activePromo
                        ? `${activePromo.promoPrice.toLocaleString("ru-RU")} ₽`
                        : formatPrice(preselectedService.price, preselectedService.pricePrefix)}
                    </span>
                  </div>
                </div>
              )}

              {/* Scrollable form */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2 pt-1 sm:px-5 sm:pb-4 sm:pt-2">
                <BookingForm
                  preselectedServiceId={preselectedService?.id}
                  onSuccess={close}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

// ─── Helpers ───────────────────────────────────────────────────────────
const ServiceInfoOverlay = ({
  service,
  activePromo,
}: {
  service: Service;
  activePromo: ReturnType<typeof promotionsData.find> | null;
}) => (
  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
      {service.categoryLabel}
    </p>
    <h3 className="font-display text-lg font-semibold leading-snug line-clamp-2">
      {service.name}
    </h3>
    <div className="mt-2">
      <PriceRow service={service} activePromo={activePromo} />
    </div>
  </div>
);

const PriceRow = ({
  service,
  activePromo,
  mobile = false,
}: {
  service: Service;
  activePromo: ReturnType<typeof promotionsData.find> | null;
  mobile?: boolean;
}) => (
  <div className={`flex flex-wrap items-center gap-1.5 ${mobile ? "text-white" : ""}`}>
    {activePromo ? (
      <>
        <span className={`font-bold text-primary ${mobile ? "text-base" : "text-xl"}`}>
          {activePromo.promoPrice.toLocaleString("ru-RU")} ₽
        </span>
        <span className="text-sm line-through opacity-50">
          {formatPrice(service.price, service.pricePrefix)}
        </span>
        <span className="rounded-full bg-primary/80 px-2 py-0.5 text-xs font-semibold text-white">
          -{activePromo.discount}
        </span>
      </>
    ) : (
      <>
        <span className={`font-bold ${mobile ? "text-base" : "text-xl"}`}>
          {formatPrice(service.price, service.pricePrefix)}
        </span>
        {service.oldPrice && (
          <span className="text-sm line-through opacity-50">
            {formatPrice(service.oldPrice)}
          </span>
        )}
      </>
    )}
    {service.duration && (
      <span className="flex items-center gap-1 text-xs opacity-60">
        <Clock size={11} /> {service.duration}
      </span>
    )}
  </div>
);

export default BookingDialog;
