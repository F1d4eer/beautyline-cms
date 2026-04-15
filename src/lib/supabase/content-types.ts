// TypeScript interfaces for each site_content JSONB section

export interface SiteSettingsContent {
  studioName: string;
  tagline: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  telegram: string;
  email: string;
  address: string;
  workingHours: string;
  rating: number;
  reviewsCount: number;
}

export interface SeoContent {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export interface HeroContent {
  heading: string;
  subheading: string;
  badge: string;
  ctaText: string;
  ctaSecondaryText: string;
  image: string;
}

export interface ServiceCategoryItem {
  key: string;
  label: string;
}

export interface ServiceCategoriesContent {
  items: ServiceCategoryItem[];
}

export interface PromotionItem {
  id: string;
  title: string;
  discount: string;
  originalPrice?: number;
  promoPrice: number;
  endsAt: string;
  promoServiceId?: string;
  image?: string;
}

export interface PromotionsContent {
  items: PromotionItem[];
}

export interface MasterItem {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  serviceCategories: string[];
}

export interface MastersContent {
  items: MasterItem[];
}

export interface GalleryItem {
  id: string;
  image: string;
  alt: string;
  category?: string;
  isActive: boolean;
}

export interface GalleryContent {
  items: GalleryItem[];
}

export interface BookingContent {
  heading: string;
  subtitle: string;
  privacyText: string;
  successTitle: string;
  successMessage: string;
}

export interface ContactsContent {
  heading: string;
  subtitle: string;
  mapEmbedUrl: string;
}
