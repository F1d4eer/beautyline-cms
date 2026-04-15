import { siteSettings } from "@/data/siteData";
import { useContent } from "@/hooks/use-content";
import { SiteSettingsContent } from "@/lib/supabase/content-types";

const Footer = () => {
  const { data } = useContent<SiteSettingsContent>("settings", siteSettings);
  return (
    <footer className="bg-surface-low px-6 py-12 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <p className="font-display text-sm font-bold tracking-tight text-foreground">
            {data.studioName.toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{data.tagline}</p>
        </div>

        <div className="flex gap-6">
          <a href={data.whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            WhatsApp
          </a>
          <a href={`tel:${data.phoneRaw}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {data.phone}
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {data.studioName}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
