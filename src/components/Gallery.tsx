import { motion } from "framer-motion";
import { galleryData, serviceCategories } from "@/data/siteData";
import { useContent } from "@/hooks/use-content";
import { GalleryContent } from "@/lib/supabase/content-types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

// Fallback: local assets from siteData
const GALLERY_FALLBACK: GalleryContent = {
  items: galleryData.map((g) => ({
    id:       g.id,
    image:    g.image as string,
    alt:      g.alt,
    category: g.category,
    isActive: g.isActive,
  })),
};

const Gallery = () => {
  const { data } = useContent<GalleryContent>("gallery", GALLERY_FALLBACK);
  const activeItems = data.items.filter((item) => item.isActive);

  return (
    <section id="gallery" className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-12 text-center"
        >
          <motion.p variants={fadeUp} className="label-text mb-3">Визуальная поэтика</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Наши Работы
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2 sm:-ml-3">
              {activeItems.map((item) => (
                <CarouselItem key={item.id} className="pl-2 basis-1/2 sm:pl-3 md:basis-1/3 lg:basis-1/4">
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  {item.category && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {serviceCategories.find((c) => c.key === item.category)?.label}
                    </p>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 border-none bg-card shadow-lg" />
            <CarouselNext className="hidden md:flex -right-4 border-none bg-card shadow-lg" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery;
