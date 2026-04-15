import { contactsData, siteSettings } from "@/data/siteData";
import { useContent } from "@/hooks/use-content";
import { ContactsContent, SiteSettingsContent } from "@/lib/supabase/content-types";
import { MapPin, Clock, Phone, Mail } from "lucide-react";

const Contacts = () => {
  const { data: contacts } = useContent<ContactsContent>("contacts", contactsData);
  const { data: settings } = useContent<SiteSettingsContent>("settings", siteSettings);

  return (
    <section id="contacts" className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="label-text mb-3">{contacts.subtitle}</p>
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {contacts.heading}
          </h2>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* Map */}
          <div className="overflow-hidden rounded-[1.5rem] bg-surface-container sm:rounded-[2rem]" style={{ minHeight: 260 }}>
            <iframe
              src={contacts.mapEmbedUrl}
              className="h-full min-h-[260px] w-full sm:min-h-[350px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Карта"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-start gap-4">
              <MapPin className="mt-0.5 shrink-0 text-primary" size={20} />
              <div>
                <p className="label-text mb-1">Наш адрес</p>
                <p className="text-sm text-foreground">{settings.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="mt-0.5 shrink-0 text-primary" size={20} />
              <div>
                <p className="label-text mb-1">Режим работы</p>
                <p className="text-sm text-foreground">{settings.workingHours}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="mt-0.5 shrink-0 text-primary" size={20} />
              <div>
                <p className="label-text mb-1">Телефон</p>
                <a
                  href={`tel:${settings.phoneRaw}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="mt-0.5 shrink-0 text-primary" size={20} />
              <div>
                <p className="label-text mb-1">Email</p>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={settings.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                WhatsApp
              </a>
              <a
                href={settings.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-80"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
