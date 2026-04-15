import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Promotions from "@/components/Promotions";
import Gallery from "@/components/Gallery";
import Masters from "@/components/Masters";
import Reviews from "@/components/Reviews";
import BookingSection from "@/components/BookingSection";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/BookingDialog";
import { BookingProvider, useBooking } from "@/context/BookingContext";

const PageContent = () => {
  const { state, closeBooking } = useBooking();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Promotions />
        <Gallery />
        <Masters />
        <Reviews />
        <BookingSection />
        <Contacts />
      </main>
      <Footer />
      <BookingDialog
        open={state.open}
        onOpenChange={(v) => { if (!v) closeBooking(); }}
        preselectedService={state.preselectedService}
      />
    </>
  );
};

const Index = () => (
  <BookingProvider>
    <PageContent />
  </BookingProvider>
);

export default Index;
