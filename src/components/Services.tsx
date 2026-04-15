import { useState } from "react";
import { motion } from "framer-motion";
import { serviceCategories, type ServiceCategory, type Service } from "@/data/siteData";
import { Clock } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { fadeUp, staggerContainer, cardReveal, viewportOnce } from "@/lib/motion";
import { useServices } from "@/hooks/use-services";
import { SwipeSlider } from "./SwipeSlider";

const formatPrice = (price: number, prefix?: string) => {
  const formatted = price.toLocaleString("ru-RU");
  return prefix ? `${prefix} ${formatted} ₽` : `${formatted} ₽`;
};

const CardSlider = ({ service }: { service: Service }) => {
  const images = service.images && service.images.length > 1
    ? service.images
    : [service.image];
  return (
    <div className="aspect-[16/9] overflow-hidden group">
      <SwipeSlider images={images} alt={service.alt} className="h-full w-full" />
    </div>
  );
};

const Services = () => {
  const [active, setActive] = useState<ServiceCategory>("all");
  const { openBooking } = useBooking();
  const { services } = useServices();

  const filtered = active === "all"
    ? services
    : services.filter((s) => s.category === active);

  return (
    <section id="services" className="section-padding bg-surface-low">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-10 text-center"
        >
          <motion.p variants={fadeUp} className="label-text mb-3">Каталог услуг</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Меню Студии
          </motion.h2>
        </motion.div>

        {/* Category tabs — scrollable on mobile */}
        <div className="mb-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
          {serviceCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 min-h-[44px] ${
                active === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-container text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((service) => (
            <motion.div
              key={service.id}
              variants={cardReveal}
              className="group flex flex-col overflow-hidden rounded-[1.5rem] bg-card transition-shadow duration-300"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <CardSlider service={service} />

              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                  <p className="label-text mb-1.5 text-xs">{service.categoryLabel}</p>
                  <h3 className="font-display text-sm font-semibold text-foreground sm:text-base">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-base font-semibold text-foreground">
                        {formatPrice(service.price, service.pricePrefix)}
                      </p>
                      {service.oldPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(service.oldPrice)}
                        </p>
                      )}
                    </div>
                    {service.discount && (
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {service.discount}
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                      <Clock size={11} />
                      <span className="text-xs">{service.duration}</span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openBooking(service)}
                    className="shrink-0 rounded-full bg-surface-container px-4 py-2 text-xs font-medium uppercase tracking-wider text-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground min-h-[40px]"
                  >
                    Выбрать
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
