import heroEye from "@/assets/hero-eye.jpg";
import galleryNails from "@/assets/gallery-nails.jpg";
import galleryLashes from "@/assets/gallery-lashes.jpg";
import galleryPedicure from "@/assets/gallery-pedicure.jpg";
import galleryNailart from "@/assets/gallery-nailart.jpg";
import galleryNailart2 from "@/assets/gallery-nailart2.jpg";
import galleryFrench from "@/assets/gallery-french.jpg";
import galleryLashes2 from "@/assets/gallery-lashes2.jpg";
import galleryPedicure2 from "@/assets/gallery-pedicure2.jpg";
import masterVictoria from "@/assets/master-victoria.jpg";
import masterKarina from "@/assets/master-karina.jpg";
import serviceLashes from "@/assets/service-lashes.jpg";
import serviceNails from "@/assets/service-nails.jpg";
import servicePedicure from "@/assets/service-pedicure.jpg";

// ===================== SITE SETTINGS =====================
export const siteSettings = {
  studioName: "Beautyline Studio",
  tagline: "Студия мастера маникюра, педикюра и наращивания ресниц",
  phone: "+7 (925) 963-52-27",
  phoneRaw: "79259635227",
  whatsapp: "https://wa.me/79259635227",
  telegram: "https://t.me/beautylinestudio",
  email: "beautyline.studio@mail.ru",
  address: "г. Бронницы, Гаражный проезд, 1, Кабинет 2",
  mapCoords: { lat: 55.4267, lng: 38.2612 },
  workingHours: "Ежедневно 10:00 — 21:00",
  socials: {
    whatsapp: "https://wa.me/79259635227",
    telegram: "https://t.me/beautylinestudio",
  },
  rating: 5.0,
  reviewsCount: 34,
};

// ===================== SEO DATA =====================
export const seoData = {
  title: "Beautyline Studio — Маникюр, Педикюр, Наращивание ресниц | Бронницы",
  description:
    "Студия красоты Beautyline Studio в Бронницах. Профессиональный маникюр, педикюр, наращивание ресниц. Рейтинг 5.0 ★ Запись онлайн.",
  keywords: "маникюр бронницы, педикюр бронницы, наращивание ресниц бронницы, студия красоты, beautyline studio",
  ogImage: heroEye,
};

// ===================== HERO =====================
export const heroData = {
  heading: "Искусство\nТочности",
  subheading: "Создаём идеальный образ через авторское видение и безупречную технику. Ваше пространство уникальной эстетики.",
  image: heroEye,
  badge: "EST. 2023",
  ctaText: "Записаться",
  ctaSecondaryText: "Каталог услуг",
};

// ===================== SERVICES =====================
export type ServiceCategory = "all" | "lashes" | "nails" | "pedicure";

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  categoryLabel: string;
  price: number;
  oldPrice?: number;
  pricePrefix?: string;
  discount?: string;
  duration: string;
  image: string;
  images?: string[];
  alt: string;
  isActive: boolean;
}

export const serviceCategories: { key: ServiceCategory; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "lashes", label: "Ресницы" },
  { key: "nails", label: "Руки" },
  { key: "pedicure", label: "Ноги" },
];

export const servicesData: Service[] = [
  // Ресницы
  { id: "s1", name: "Классическое наращивание ресниц", description: "Натуральный эффект, подчёркивающий естественную красоту глаз", category: "lashes", categoryLabel: "Ресницы", price: 2300, duration: "1ч 20м", image: serviceLashes, alt: "Классическое наращивание ресниц", isActive: true },
  { id: "s2", name: "Наращивание ресниц (1.5D)", description: "Лёгкий объём для повседневного образа", category: "lashes", categoryLabel: "Ресницы", price: 2500, duration: "2ч", image: serviceLashes, alt: "Наращивание ресниц 1.5D", isActive: true },
  { id: "s3", name: "Наращивание ресниц (2D)", description: "Выразительный объём для яркого взгляда", category: "lashes", categoryLabel: "Ресницы", price: 2700, duration: "2ч", image: serviceLashes, alt: "Наращивание ресниц 2D", isActive: true },
  { id: "s4", name: "Наращивание ресниц (2.5D)", description: "Насыщенный объём для особых случаев", category: "lashes", categoryLabel: "Ресницы", price: 2900, duration: "2ч", image: serviceLashes, alt: "Наращивание ресниц 2.5D", isActive: true },
  { id: "s5", name: "Наращивание ресниц (3D)", description: "Максимальный объём и драматический эффект", category: "lashes", categoryLabel: "Ресницы", price: 3000, duration: "2ч", image: serviceLashes, alt: "Наращивание ресниц 3D", isActive: true },
  { id: "s6", name: "Неполное наращивание (уголки)", description: "Акцент на внешние уголки глаз", category: "lashes", categoryLabel: "Ресницы", price: 2100, duration: "1ч", image: serviceLashes, alt: "Неполное наращивание ресниц", isActive: true },
  { id: "s7", name: "Коррекция ресниц", description: "Обновление и поддержание наращённых ресниц", category: "lashes", categoryLabel: "Ресницы", price: 1500, pricePrefix: "от", duration: "40м", image: serviceLashes, alt: "Коррекция ресниц", isActive: true },
  { id: "s8", name: "Наращивание нижних ресниц", description: "Дополнительный объём нижнего ряда", category: "lashes", categoryLabel: "Ресницы", price: 1000, duration: "30м", image: serviceLashes, alt: "Наращивание нижних ресниц", isActive: true },
  { id: "s9", name: "Трендовые эффекты", description: "Авторские техники: лучики, мокрый эффект, кукольный", category: "lashes", categoryLabel: "Ресницы", price: 3100, pricePrefix: "от", duration: "2ч", image: serviceLashes, alt: "Трендовые эффекты наращивания", isActive: true },
  { id: "s10", name: "Снятие ресниц", description: "Бережное снятие без вреда для натуральных ресниц", category: "lashes", categoryLabel: "Ресницы", price: 500, duration: "15м", image: serviceLashes, alt: "Снятие ресниц", isActive: true },
  // Руки
  { id: "s11", name: "Маникюр с покрытием в один тон", description: "Аппаратный маникюр + стойкое покрытие гель-лаком", category: "nails", categoryLabel: "Руки", price: 2300, duration: "1ч 30м", image: serviceNails, alt: "Маникюр с покрытием", isActive: true },
  { id: "s12", name: "Аппаратный маникюр", description: "Профессиональный маникюр без покрытия", category: "nails", categoryLabel: "Руки", price: 1300, duration: "1ч", image: serviceNails, alt: "Аппаратный маникюр", isActive: true },
  { id: "s13", name: "Наращивание ногтей на верхние формы", description: "Моделирование идеальной формы и длины", category: "nails", categoryLabel: "Руки", price: 2800, duration: "2ч 30м", image: serviceNails, alt: "Наращивание ногтей", isActive: true },
  { id: "s14", name: "Френч или дизайн", description: "Декоративное оформление: френч, рисунки, стразы", category: "nails", categoryLabel: "Руки", price: 200, duration: "30м", image: serviceNails, alt: "Френч дизайн ногтей", isActive: true },
  // Ноги
  { id: "s15", name: "Педикюр полный с покрытием и smart", description: "Комплексный уход: обработка стоп + покрытие гель-лаком", category: "pedicure", categoryLabel: "Ноги", price: 2500, duration: "2ч", image: servicePedicure, alt: "Полный педикюр с покрытием", isActive: true },
  { id: "s16", name: "Педикюр без покрытия", description: "Гигиенический педикюр и обработка стоп", category: "pedicure", categoryLabel: "Ноги", price: 1500, duration: "1ч 30м", image: servicePedicure, alt: "Педикюр без покрытия", isActive: true },
  { id: "s17", name: "Педикюр и покрытие без стоп", description: "Обработка ногтей + покрытие гель-лаком", category: "pedicure", categoryLabel: "Ноги", price: 2000, duration: "1ч 30м", image: servicePedicure, alt: "Педикюр и покрытие без стоп", isActive: true },
];

// ===================== PROMOTIONS =====================
export interface Promotion {
  id: string;
  title: string;
  discount: string;
  originalPrice?: number;
  promoPrice: number;
  /** ISO date string, e.g. "2026-04-30" */
  endsAt: string;
  /** Optional serviceId to preselect in booking form */
  promoServiceId?: string;
}

export const promotionsData: Promotion[] = [
  {
    id: "p1",
    title: "Маникюр с покрытием в один тон + педикюр с покрытием без стоп",
    discount: "75%",
    promoPrice: 539,
    endsAt: "2026-04-30",
    promoServiceId: "s11",
  },
];

// ===================== MASTERS =====================
export interface Master {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  serviceCategories: ServiceCategory[];
}

export const mastersData: Master[] = [
  {
    id: "m1",
    name: "Виктория",
    role: "Топ-мастер",
    image: masterVictoria,
    rating: 5.0,
    reviewsCount: 27,
    specialties: ["Маникюр", "Педикюр"],
    serviceCategories: ["nails", "pedicure"],
  },
  {
    id: "m2",
    name: "Карина",
    role: "Мастер по наращиванию ресниц",
    image: masterKarina,
    rating: 5.0,
    reviewsCount: 6,
    specialties: ["Наращивание ресниц"],
    serviceCategories: ["lashes"],
  },
];

// ===================== GALLERY =====================
export interface GalleryItem {
  id: string;
  image: string;
  alt: string;
  category?: ServiceCategory;
  isActive: boolean;
}

export const galleryData: GalleryItem[] = [
  { id: "g1", image: galleryNails, alt: "Маникюр — работа студии", category: "nails", isActive: true },
  { id: "g2", image: heroEye, alt: "Наращивание ресниц — работа студии", category: "lashes", isActive: true },
  { id: "g3", image: galleryPedicure, alt: "Педикюр — работа студии", category: "pedicure", isActive: true },
  { id: "g4", image: galleryLashes, alt: "Инструменты для наращивания ресниц", category: "lashes", isActive: true },
  { id: "g5", image: galleryNailart, alt: "Дизайн ногтей — работа студии", category: "nails", isActive: true },
  { id: "g6", image: galleryFrench, alt: "Френч маникюр — работа студии", category: "nails", isActive: true },
  { id: "g7", image: galleryNailart2, alt: "Яркий нейл-арт — работа студии", category: "nails", isActive: true },
  { id: "g8", image: galleryLashes2, alt: "Объёмное наращивание ресниц", category: "lashes", isActive: true },
  { id: "g9", image: galleryPedicure2, alt: "Нюдовый маникюр — работа студии", category: "nails", isActive: true },
];

// ===================== REVIEWS =====================
export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  serviceId: string;
  masterId: string;
  date?: string;
  reply?: string;
  isActive: boolean;
}

export const reviewsData: Review[] = [
  {
    id: "r1",
    name: "Клиент",
    rating: 5,
    text: "Вика просто огонь 🔥 Качественный, красивый педикюр всего за час, как всегда 100/10",
    serviceId: "s17",
    masterId: "m1",
    reply: "Большое спасибо, очень приятно 🩷☺️",
    isActive: true,
  },
  {
    id: "r2",
    name: "Клиент",
    rating: 5,
    text: "Отличный мастер, Виктория профессионал своего дела, работает быстро и качественно, маникюр носится прекрасно даже дольше положенного срока. Очень рекомендую!",
    serviceId: "s11",
    masterId: "m1",
    reply: "Большое спасибо, очень приятно 🩷",
    isActive: true,
  },
  {
    id: "r3",
    name: "Клиент",
    rating: 5,
    text: "Мастер очень приятный, комфортный, очень приятно общаться 🙈 спасибо за ноготочки ❤️ очень красиво, любуюсь теперь",
    serviceId: "s11",
    masterId: "m1",
    isActive: true,
  },
  {
    id: "r4",
    name: "Клиент",
    rating: 5,
    text: "Все очень понравилось, было очень комфортно ❤️",
    serviceId: "s11",
    masterId: "m1",
    reply: "Спасибо за отзыв 🌸",
    isActive: true,
  },
  {
    id: "r5",
    name: "Клиент",
    rating: 5,
    text: "Отличная студия, вежливая и приятная мастер Виктория, сделала качественный и шикарный педикюр! 😄 Рекомендую)",
    serviceId: "s15",
    masterId: "m1",
    reply: "Большое спасибо 🌸",
    isActive: true,
  },
  {
    id: "r6",
    name: "Анна",
    rating: 5,
    text: "Делала наращивание ресниц 2D у Карины. Результат потрясающий! Реснички лёгкие, выглядят очень натурально. Буду приходить на коррекцию!",
    serviceId: "s3",
    masterId: "m2",
    date: "март 2024",
    reply: "Спасибо, Анна! Ждём вас снова 🤍",
    isActive: true,
  },
  {
    id: "r7",
    name: "Екатерина",
    rating: 5,
    text: "Хожу к Виктории уже полгода. Маникюр всегда идеальный, покрытие держится 3-4 недели без сколов. Лучший мастер!",
    serviceId: "s11",
    masterId: "m1",
    date: "февраль 2024",
    isActive: true,
  },
  {
    id: "r8",
    name: "Марина",
    rating: 5,
    text: "Первый раз была на наращивании ресниц, немного переживала. Карина всё подробно объяснила, подобрала идеальный изгиб. Очень довольна результатом!",
    serviceId: "s1",
    masterId: "m2",
    date: "январь 2024",
    isActive: true,
  },
];

// ===================== BOOKING FORM =====================
export const bookingData = {
  heading: "Записаться на приём",
  subtitle: "Выберите услугу и удобное время — мы свяжемся с вами для подтверждения",
  privacyText: "Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных",
  successTitle: "Заявка отправлена!",
  successMessage: "Мы свяжемся с вами в ближайшее время для подтверждения записи.",
};

// ===================== CONTACTS SECTION =====================
export const contactsData = {
  heading: "Местоположение",
  subtitle: "Мы ждём вас",
  mapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=38.2612%2C55.4267&z=16&pt=38.2612%2C55.4267%2Cpm2rdm",
};
