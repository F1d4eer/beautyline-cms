import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeSliderProps {
  images: string[];
  alt: string;
  className?: string;
}

export const SwipeSlider = ({ images, alt, className = "" }: SwipeSliderProps) => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  if (images.length === 0) return null;

  const prev = () => { setDir(-1); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = () => { setDir(1);  setIdx((i) => (i + 1) % images.length); };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Swipeable image */}
      <motion.div
        className="h-full w-full touch-pan-y select-none"
        drag={images.length > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          const isHoriz = Math.abs(info.offset.x) > Math.abs(info.offset.y);
          if (!isHoriz) return;
          if (info.offset.x < -40) next();
          else if (info.offset.x > 40) prev();
        }}
      >
        <AnimatePresence custom={dir} initial={false} mode="popLayout">
          <motion.img
            key={idx}
            src={images[idx]}
            alt={alt}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
            className="pointer-events-none h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>
      </motion.div>

      {/* Arrow buttons (visible on desktop/hover) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100 sm:opacity-100"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100 sm:opacity-100"
            aria-label="Следующее фото"
          >
            <ChevronRight size={15} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SwipeSlider;
