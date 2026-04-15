import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import SeoEditor from "./content-editors/SeoEditor";
import BookingEditor from "./content-editors/BookingEditor";
import ContactsEditor from "./content-editors/ContactsEditor";
import SettingsEditor from "./content-editors/SettingsEditor";
import HeroEditor from "./content-editors/HeroEditor";
import ServiceCategoriesEditor from "./content-editors/ServiceCategoriesEditor";
import PromotionsEditor from "./content-editors/PromotionsEditor";
import MastersEditor from "./content-editors/MastersEditor";
import GalleryEditor from "./content-editors/GalleryEditor";

const EDITORS: Record<string, { label: string; component: React.ComponentType }> = {
  hero:              { label: "Hero",           component: HeroEditor },
  settings:          { label: "Настройки",      component: SettingsEditor },
  seo:               { label: "SEO",            component: SeoEditor },
  booking:           { label: "Форма записи",   component: BookingEditor },
  contacts:          { label: "Контакты",       component: ContactsEditor },
  promotions:        { label: "Акции",          component: PromotionsEditor },
  masters:           { label: "Мастера",        component: MastersEditor },
  gallery:           { label: "Галерея",        component: GalleryEditor },
  serviceCategories: { label: "Категории услуг", component: ServiceCategoriesEditor },
};

const SectionEditor = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const editor = sectionId ? EDITORS[sectionId] : null;

  if (!editor) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <p className="text-lg font-semibold">Секция не найдена</p>
        <Link to="/admin/content" className="mt-3 inline-block text-sm text-primary hover:underline">
          ← Вернуться к контенту
        </Link>
      </div>
    );
  }

  const EditorComponent = editor.component;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          to="/admin/content"
          className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
          Контент
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground">{editor.label}</h1>
      </div>

      <EditorComponent />
    </div>
  );
};

export default SectionEditor;
