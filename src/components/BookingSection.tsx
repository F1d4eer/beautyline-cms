import { bookingData } from "@/data/siteData";
import { useBooking } from "@/context/BookingContext";
import { useContent } from "@/hooks/use-content";
import { BookingContent } from "@/lib/supabase/content-types";

const BookingSection = () => {
  const { openBooking } = useBooking();
  const { data } = useContent<BookingContent>("booking", bookingData);

  return (
    <section id="booking" className="section-padding bg-surface-low">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-10">
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {data.heading}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{data.subtitle}</p>
        </div>

        <button
          onClick={() => openBooking()}
          className="rounded-full bg-primary px-10 py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-opacity duration-300 hover:opacity-90"
        >
          Записаться
        </button>
      </div>
    </section>
  );
};

export default BookingSection;
