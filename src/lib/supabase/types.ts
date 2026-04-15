export type BookingStatus = "new" | "confirmed" | "cancelled" | "blocked";

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          name: string;
          phone: string;
          service_id: string | null;
          master_id: string | null;
          date: string | null;
          time: string | null;
          comment: string | null;
          status: BookingStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at" | "status"> & {
          status?: BookingStatus;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };
      reviews: {
        Row: {
          id: string;
          name: string;
          text: string;
          rating: number;
          service_id: string | null;
          master_id: string | null;
          contact: string | null;
          date: string | null;
          reply: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "is_active" | "reply"> & {
          is_active?: boolean;
          reply?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          category_label: string | null;
          price: number;
          old_price: number | null;
          price_prefix: string | null;
          discount: string | null;
          duration: string | null;
          image_url: string | null;
          images: string[] | null;
          is_active: boolean;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "sort_order"> & { sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
      };
      master_schedules: {
        Row: { master_id: string; working_days: number[]; slots: string[]; updated_at: string };
        Insert: { master_id: string; working_days?: number[]; slots?: string[]; updated_at?: string };
        Update: Partial<{ working_days: number[]; slots: string[]; updated_at: string }>;
      };
      site_settings: {
        Row: { key: string; value: string };
        Insert: { key: string; value: string };
        Update: { value?: string };
      };
      site_content: {
        Row: { id: string; content: Record<string, unknown>; updated_at: string };
        Insert: { id: string; content: Record<string, unknown>; updated_at?: string };
        Update: { content?: Record<string, unknown>; updated_at?: string };
      };
      navigation_items: {
        Row: { id: number; label: string; href: string; sort_order: number };
        Insert: { id?: number; label: string; href: string; sort_order?: number };
        Update: Partial<{ label: string; href: string; sort_order: number }>;
      };
    };
  };
}

// Convenience row types
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type MasterScheduleRow = Database["public"]["Tables"]["master_schedules"]["Row"];
export type SiteContentRow = Database["public"]["Tables"]["site_content"]["Row"];
export type NavigationItemRow = Database["public"]["Tables"]["navigation_items"]["Row"];
