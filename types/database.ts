export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          subcategory: string | null;
          price: number;
          sale_price: number | null;
          on_sale: boolean | null;
          images: string[] | null;
          created_at: string;
          brand: string | null;
          badge: string | null;
          notes: string | null;
          occasion: string | null;
          slug: string | null;
          sales_count: number | null;
          in_stock: boolean | null;
          stock_quantity: number | null;
          low_stock_threshold: number | null;
          is_new_arrival: boolean | null;
          is_drop: boolean | null;
          release_date: string | null;
          early_access_price: number | null;
          description: string | null;
          top_notes: string[] | null;
          heart_notes: string[] | null;
          base_notes: string[] | null;
          sale_ends_at: string | null;
          product_type: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          subcategory?: string | null;
          price: number;
          sale_price?: number | null;
          on_sale?: boolean | null;
          images?: string[] | null;
          created_at?: string;
          brand?: string | null;
          badge?: string | null;
          notes?: string | null;
          occasion?: string | null;
          slug?: string | null;
          sales_count?: number | null;
          in_stock?: boolean | null;
          stock_quantity?: number | null;
          low_stock_threshold?: number | null;
          is_new_arrival?: boolean | null;
          is_drop?: boolean | null;
          release_date?: string | null;
          early_access_price?: number | null;
          description?: string | null;
          top_notes?: string[] | null;
          heart_notes?: string[] | null;
          base_notes?: string[] | null;
          sale_ends_at?: string | null;
          product_type?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      gift_set_items: {
        Row: {
          id: string;
          gift_set_id: string;
          product_id: string;
          quantity: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          gift_set_id: string;
          product_id: string;
          quantity?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["gift_set_items"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      product_subcategories: {
        Row: {
          id: string;
          parent_category: string;
          name: string;
          slug: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_category: string;
          name: string;
          slug: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_subcategories"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          price: number;
          sale_price: number | null;
          stock_quantity: number | null;
          low_stock_threshold: number;
          sort_order: number;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          label?: string;
          price: number;
          sale_price?: number | null;
          stock_quantity?: number | null;
          low_stock_threshold?: number;
          sort_order?: number;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brands"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          status: string;
          payment_provider: string | null;
          payment_reference: string | null;
          email: string;
          phone: string | null;
          first_name: string;
          last_name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          country: string;
          subtotal: number;
          total: number;
          currency: string;
          coupon_code: string | null;
          discount_amount: number;
          confirmation_email_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          status?: string;
          payment_provider?: string | null;
          payment_reference?: string | null;
          email: string;
          phone?: string | null;
          first_name: string;
          last_name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          country?: string;
          subtotal: number;
          total: number;
          currency?: string;
          coupon_code?: string | null;
          discount_amount?: number;
          confirmation_email_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string | null;
          size: string | null;
          quantity: number;
          unit_price: number;
          compare_at_price: number | null;
          line_total: number;
          created_at: string;
          bundle_details: Json | null;
          variant_id: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          product_image?: string | null;
          size?: string | null;
          quantity: number;
          unit_price: number;
          compare_at_price?: number | null;
          line_total: number;
          created_at?: string;
          bundle_details?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          min_order: number;
          max_uses: number | null;
          used_count: number;
          active: boolean;
          expires_at: string | null;
          created_at: string;
          max_discount: number | null;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          min_order?: number;
          max_uses?: number | null;
          used_count?: number;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          max_discount?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          cover_image: string;
          author: string;
          published_at: string;
          read_minutes: number;
          category: string;
          body: string;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          cover_image: string;
          author?: string;
          published_at: string;
          read_minutes?: number;
          category?: string;
          body: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
      faq_categories: {
        Row: {
          id: string;
          title: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faq_categories"]["Insert"]>;
        Relationships: [];
      };
      faq_items: {
        Row: {
          id: string;
          category_id: string;
          question: string;
          answer: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          question: string;
          answer: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faq_items"]["Insert"]>;
        Relationships: [];
      };
      announcement_settings: {
        Row: {
          singleton: boolean;
          active: boolean;
          badge_label: string;
          message_short: string;
          message_full: string;
          read_link_label: string;
          read_link_href: string;
          updated_at: string;
        };
        Insert: {
          singleton?: boolean;
          active?: boolean;
          badge_label?: string;
          message_short: string;
          message_full: string;
          read_link_label?: string;
          read_link_href?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcement_settings"]["Insert"]>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          active: boolean;
          badge_label: string;
          message_short: string;
          message_full: string;
          read_link_label: string;
          read_link_href: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          active?: boolean;
          badge_label?: string;
          message_short: string;
          message_full: string;
          read_link_label?: string;
          read_link_href?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
        Relationships: [];
      };
      announcement_links: {
        Row: {
          id: string;
          announcement_id: string | null;
          label: string;
          href: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          announcement_id?: string | null;
          label: string;
          href: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["announcement_links"]["Insert"]>;
        Relationships: [];
      };
      site_pages: {
        Row: {
          page_key: string;
          content: Json;
          updated_at: string;
        };
        Insert: {
          page_key: string;
          content?: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_pages"]["Insert"]>;
        Relationships: [];
      };
      checkout_intents: {
        Row: {
          id: string;
          customer: Json;
          address: Json;
          priced_items: Json;
          subtotal: number;
          total: number;
          discount_amount: number;
          coupon_code: string | null;
          payment_provider: string | null;
          payment_reference: string | null;
          order_id: string | null;
          status: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer: Json;
          address: Json;
          priced_items: Json;
          subtotal: number;
          total: number;
          discount_amount?: number;
          coupon_code?: string | null;
          payment_provider?: string | null;
          payment_reference?: string | null;
          order_id?: string | null;
          status?: string;
          expires_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["checkout_intents"]["Insert"]>;
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
