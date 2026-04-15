import { motion } from "framer-motion";
import { heroData } from "@/data/siteData";
import { useContent, resolveImage } from "@/hooks/use-content";
import { HeroContent } from "@/lib/supabase/content-types";
import { fadeUp, fadeIn, staggerContainer } from "@/lib/motion";
import { useBooking } from "@/context/BookingContext";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const Hero = () => {
  const { openBooking } = useBooking();
  const scrollTo = useSmoothScroll();
  const { data } = useContent<HeroContent>("hero", heroData);
  const heroImage = resolveImage(data.image, data.image);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
        {/* Text */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-center space-y-8"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl font-light leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-7xl lg:text-[5.5rem]"
          >
            {data.heading.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-md text-base leading-relaxed text-muted-foreground">
            {data.subheading}
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center gap-4 pt-2">
            <span className="label-text text-muted-foreground">— {data.badge}</span>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-4">
            <motion.button
              onClick={() => openBooking()}
              whileHover={{ opacity: 0.88 }}
              whileTap={{ scale: 0.97 }}
              className="min-h-[48px] w-full rounded-full bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all duration-300 sm:w-auto"
            >
              {data.ctaText}
            </motion.button>
            <motion.button
              onClick={() => scrollTo("#services")}
              whileHover={{ opacity: 0.82 }}
              whileTap={{ scale: 0.97 }}
              className="min-h-[48px] w-full rounded-full bg-secondary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-secondary-foreground transition-all duration-300 sm:w-auto"
            >
              {data.ctaSecondaryText}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Image */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[2rem]">
            <img
              src={heroImage}
              alt="Beautyline Studio — наращивание ресниц"
              className="h-auto w-full object-cover"
              width={1280}
              height={720}
            />
          </div>

          {/* Floating card — hidden on very small screens */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute -bottom-4 right-4 hidden rounded-2xl bg-card/90 p-5 shadow-lg backdrop-blur-xl sm:block md:right-8"
          >
            <p className="label-text mb-1">Избранная услуга</p>
            <p className="font-display text-sm font-semibold text-foreground">
              Наращивание ресниц
            </p>
            <p className="text-xs text-muted-foreground">от 2 300 ₽</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
