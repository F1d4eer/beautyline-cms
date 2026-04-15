import { createContext, useContext, useState } from "react";
import type { Service } from "@/data/siteData";

interface BookingState {
  open: boolean;
  preselectedService: Service | null;
}

interface BookingContextValue {
  state: BookingState;
  openBooking: (service?: Service | null) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<BookingState>({ open: false, preselectedService: null });

  const openBooking = (service?: Service | null) => {
    setState({ open: true, preselectedService: service ?? null });
  };

  const closeBooking = () => {
    setState({ open: false, preselectedService: null });
  };

  return (
    <BookingContext.Provider value={{ state, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};
