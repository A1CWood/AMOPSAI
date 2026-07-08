// Hand-written to match supabase/migrations/0001_init.sql. If the schema
// changes, prefer regenerating this via `supabase gen types typescript`
// against the live project once one exists.
export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          company: string | null;
          name: string;
          phone: string | null;
          alt_phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company?: string | null;
          name: string;
          phone?: string | null;
          alt_phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company?: string | null;
          name?: string;
          phone?: string | null;
          alt_phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      log_entries: {
        Row: {
          id: string;
          template_code: string;
          template_title: string;
          body: string;
          fields: Record<string, string>;
          author_id: string;
          shift_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_code: string;
          template_title: string;
          body: string;
          fields?: Record<string, string>;
          author_id: string;
          shift_date?: string;
          created_at?: string;
        };
        // No update policy exists in RLS - entries are append-only. This
        // shape exists only to satisfy the postgrest-js GenericTable
        // constraint, not because updates are actually possible.
        Update: {
          id?: string;
          template_code?: string;
          template_title?: string;
          body?: string;
          fields?: Record<string, string>;
          author_id?: string;
          shift_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "log_entries_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
  };
};
