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
      parking_aprons: {
        Row: {
          id: string;
          code: string;
          label: string;
          x: number;
          y: number;
          width: number;
          height: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          label: string;
          x: number;
          y: number;
          width: number;
          height: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          label?: string;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      parking_spots: {
        Row: {
          id: string;
          apron_id: string;
          label: string;
          x: number;
          y: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          apron_id: string;
          label: string;
          x: number;
          y: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          apron_id?: string;
          label?: string;
          x?: number;
          y?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parking_spots_apron_id_fkey";
            columns: ["apron_id"];
            isOneToOne: false;
            referencedRelation: "parking_aprons";
            referencedColumns: ["id"];
          },
        ];
      };
      parking_assignments: {
        Row: {
          id: string;
          spot_id: string;
          aircraft: string;
          start_time: string;
          end_time: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          spot_id: string;
          aircraft: string;
          start_time: string;
          end_time?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          spot_id?: string;
          aircraft?: string;
          start_time?: string;
          end_time?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parking_assignments_spot_id_fkey";
            columns: ["spot_id"];
            isOneToOne: false;
            referencedRelation: "parking_spots";
            referencedColumns: ["id"];
          },
        ];
      };
    };
  };
};
