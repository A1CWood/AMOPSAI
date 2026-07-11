// Hand-written to match supabase/migrations/*.sql. If the schema changes,
// prefer regenerating this via `supabase gen types typescript` against the
// live project once one exists.
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
      warm_status_days: {
        Row: {
          id: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      warm_status_rows: {
        Row: {
          id: string;
          day_id: string;
          position: number;
          row_type: "show" | "open" | "flight" | "close";
          time: string | null;
          callsign: string | null;
          eta: string | null;
          etd: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_id: string;
          position?: number;
          row_type: "show" | "open" | "flight" | "close";
          time?: string | null;
          callsign?: string | null;
          eta?: string | null;
          etd?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          position?: number;
          row_type?: "show" | "open" | "flight" | "close";
          time?: string | null;
          callsign?: string | null;
          eta?: string | null;
          etd?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "warm_status_rows_day_id_fkey";
            columns: ["day_id"];
            isOneToOne: false;
            referencedRelation: "warm_status_days";
            referencedColumns: ["id"];
          },
        ];
      };
    };
  };
};
