import { motion } from "framer-motion";
import { mastersData } from "@/data/siteData";
import { useContent, resolveImage } from "@/hooks/use-content";
import { MastersContent, MasterItem } from "@/lib/supabase/content-types";
import { Star } from "lucide-react";
import { fadeUp, staggerContainer, cardReveal, viewportOnce } from "@/lib/motion";

const FALLBACK: MastersContent = {
  items: mastersData.map((m) => ({
    id:               m.id,
    name:             m.name,
    role:             m.role,
    image:            m.image as string,
    rating:           m.rating,
    reviewsCount:     m.reviewsCount,
    specialties:      m.specialties,
    serviceCategories: m.serviceCategories,
  })),
};

const MasterCard = ({ master }: { master: MasterItem }) => {
  const fallbackImage = mastersData.find((m) => m.id === master.id)?.image as string | undefined;
  const imgSrc = resolveImage(master.image, fallbackImage ?? "");

  return (
    <motion.div
      variants={cardReveal}
      className="overflow-hidden rounded-[2rem] bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={imgSrc}
          alt={master.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-xl font-semibold text-foreground">{master.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{master.role}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(master.rating) ? "fill-primary text-primary" : "text-muted"}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({master.reviewsCount})</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {master.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Masters = () => {
  const { data } = useContent<MastersContent>("masters", FALLBACK);

  return (
    <section className="section-padding bg-surface-low">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-10 text-center"
        >
          <motion.p variants={fadeUp} className="label-text mb-3">Наша команда</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Мастера
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2"
        >
          {data.items.map((master) => (
            <MasterCard key={master.id} master={master} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Masters;
