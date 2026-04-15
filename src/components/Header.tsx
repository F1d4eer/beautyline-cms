import { siteSettings } from "@/data/siteData";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useContent, useNavigationItems } from "@/hooks/use-content";
import { SiteSettingsContent } from "@/lib/supabase/content-types";

const Header = () => {
  const [open, setOpen] = useState(false);
  const { openBooking } = useBooking();
  const scrollTo = useSmoothScroll();
  const { data: settings } = useContent<SiteSettingsContent>("settings", siteSettings);
  const { items: navLinks } = useNavigationItems();

  const handleNav = (href: string) => {
    setOpen(false);
    scrollTo(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        <button
          onClick={() => scrollTo("#")}
          className="font-display text-lg font-bold tracking-tight text-foreground"
        >
          {settings.studioName.toUpperCase()}
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="label-text transition-colors duration-300 hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => openBooking()}
          className="hidden rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:opacity-90 md:inline-flex"
        >
          Записаться
        </button>

        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-low md:hidden"
          aria-label="Меню"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="glass-surface border-t border-border/10 md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="label-text min-h-[44px] rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-low"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { setOpen(false); openBooking(); }}
              className="mt-2 min-h-[48px] rounded-full bg-primary px-6 py-3 text-center text-sm font-medium text-primary-foreground"
            >
              Записаться
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
