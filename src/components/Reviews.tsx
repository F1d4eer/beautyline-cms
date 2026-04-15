import { useState } from "react";
import { motion } from "framer-motion";
import { mastersData, servicesData } from "@/data/siteData";
import { useActiveReviews, useReviewStats } from "@/hooks/use-reviews";
import { Star, Quote, MessageSquarePlus } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import ReviewForm from "./ReviewForm";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const Reviews = () => {
  const { reviews } = useActiveReviews();
  const { count, avgRating } = useReviewStats();
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  return (
    <section id="reviews" className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-12 text-center"
        >
          <motion.p variants={fadeUp} className="label-text mb-3">Голоса доверия</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Отзывы
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(avgRating) ? "fill-primary text-primary" : "fill-muted text-muted"} />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">{avgRating} / 5</span>
            <span className="text-sm text-muted-foreground">· {count} оценок</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-3 sm:-ml-4">
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="pl-3 sm:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div
                    className="flex h-full flex-col rounded-[1.5rem] bg-card p-6"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <Quote size={20} className="mb-4 text-primary/30" />
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12}
                          className={i < review.rating ? "fill-primary text-primary" : "text-muted"} />
                      ))}
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-foreground">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className="mt-4 pt-4">
                      <p className="text-xs font-medium text-foreground">
                        {review.name}
                        {review.date && (
                          <span className="ml-2 font-normal text-muted-foreground">{review.date}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mastersData.find((m) => m.id === review.masterId)?.name}
                        {review.masterId && review.serviceId && " · "}
                        {servicesData.find((s) => s.id === review.serviceId)?.name}
                      </p>
                    </div>
                    {review.reply && (
                      <div className="mt-3 rounded-xl bg-surface-low p-3">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Ответ:</span> {review.reply}
                        </p>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 border-none bg-card shadow-lg" />
            <CarouselNext className="hidden md:flex -right-4 border-none bg-card shadow-lg" />
          </Carousel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setReviewFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground min-h-[44px]"
          >
            <MessageSquarePlus size={16} />
            Оставить отзыв
          </motion.button>
        </motion.div>

        <ReviewForm open={reviewFormOpen} onOpenChange={setReviewFormOpen} />
      </div>
    </section>
  );
};

export default Reviews;
