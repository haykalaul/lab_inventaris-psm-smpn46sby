import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          name: string;
          category: 'Fisika' | 'Kimia' | 'Biologi';
          good_condition: number;
          fair_condition: number;
          damaged: number;
          lost: number;
          location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['items']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          borrower_name: string;
          class: string;
          activity: string;
          borrow_date: string;
          borrow_time: string;
          return_date: string | null;
          return_time: string | null;
          status: 'Dipinjam' | 'Dikembalikan';
          user_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          item_id: string;
          quantity: number;
          borrow_condition: 'Baik' | 'Kurang Baik';
          return_condition: 'Baik' | 'Kurang Baik' | 'Rusak' | 'Hilang' | null;
        };
        Insert: Omit<Database['public']['Tables']['transaction_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['transaction_items']['Insert']>;
      };
      journals: {
        Row: {
          id: string;
          date: string;
          time: string;
          teacher_name: string;
          class: string;
          topic: string;
          result: string;
          notes: string;
          return_date: string | null;
          signature: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['journals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['journals']['Insert']>;
      };
      journal_items: {
        Row: {
          id: string;
          journal_id: string;
          item_id: string;
          quantity: number;
        };
        Insert: Omit<Database['public']['Tables']['journal_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['journal_items']['Insert']>;
      };
      lkm_documents: {
        Row: {
          id: string;
          title: string;
          class_level: '7' | '8' | '9';
          file_url: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lkm_documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['lkm_documents']['Insert']>;
      };
    };
  };
};
