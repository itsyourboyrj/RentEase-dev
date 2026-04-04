export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          advance_applied: number | null
          arrears_included: number | null
          billing_end_date: string | null
          billing_month: string
          billing_start_date: string | null
          created_at: string | null
          current_reading: number
          current_reading_date: string | null
          electricity_amount: number
          id: string
          is_paid: boolean | null
          paid_amount: number | null
          pdf_url: string | null
          previous_reading: number
          remaining_balance: number | null
          rent_amount: number
          status: string | null
          tenant_id: string
          total_amount: number
          units_consumed: number | null
        }
        Insert: {
          advance_applied?: number | null
          arrears_included?: number | null
          billing_end_date?: string | null
          billing_month: string
          billing_start_date?: string | null
          created_at?: string | null
          current_reading: number
          current_reading_date?: string | null
          electricity_amount: number
          id?: string
          is_paid?: boolean | null
          paid_amount?: number | null
          pdf_url?: string | null
          previous_reading: number
          remaining_balance?: number | null
          rent_amount: number
          status?: string | null
          tenant_id: string
          total_amount: number
          units_consumed?: number | null
        }
        Update: {
          advance_applied?: number | null
          arrears_included?: number | null
          billing_end_date?: string | null
          billing_month?: string
          billing_start_date?: string | null
          created_at?: string | null
          current_reading?: number
          current_reading_date?: string | null
          electricity_amount?: number
          id?: string
          is_paid?: boolean | null
          paid_amount?: number | null
          pdf_url?: string | null
          previous_reading?: number
          remaining_balance?: number | null
          rent_amount?: number
          status?: string | null
          tenant_id?: string
          total_amount?: number
          units_consumed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          address: string | null
          created_at: string | null
          electricity_rate: number | null
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          electricity_rate?: number | null
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          electricity_rate?: number | null
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flats: {
        Row: {
          building_id: string
          created_at: string | null
          flat_code: string
          floor: number | null
          id: string
          is_occupied: boolean | null
          rent_amount: number
          status: string | null
        }
        Insert: {
          building_id: string
          created_at?: string | null
          flat_code: string
          floor?: number | null
          id?: string
          is_occupied?: boolean | null
          rent_amount: number
          status?: string | null
        }
        Update: {
          building_id?: string
          created_at?: string | null
          flat_code?: string
          floor?: number | null
          id?: string
          is_occupied?: boolean | null
          rent_amount?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flats_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_lang: string | null
          profile_url: string | null
          upi_id: string | null
          upi_qr_url: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_lang?: string | null
          profile_url?: string | null
          upi_id?: string | null
          upi_qr_url?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_lang?: string | null
          profile_url?: string | null
          upi_id?: string | null
          upi_qr_url?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          aadhar_number: string | null
          address: string | null
          advance_balance: number | null
          checkout_date: string | null
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          employment_status: string | null
          final_meter_reading: number | null
          flat_id: string | null
          gender: string | null
          id: string
          initial_meter_reading: number | null
          is_active: boolean | null
          join_date: string | null
          marital_status: string | null
          meter_number: string | null
          name: string
          occupancy_count: number | null
          owner_id: string
          phone: string
          profile_url: string | null
          security_deposit: number | null
          total_arrears_balance: number | null
        }
        Insert: {
          aadhar_number?: string | null
          address?: string | null
          advance_balance?: number | null
          checkout_date?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          employment_status?: string | null
          final_meter_reading?: number | null
          flat_id?: string | null
          gender?: string | null
          id?: string
          initial_meter_reading?: number | null
          is_active?: boolean | null
          join_date?: string | null
          marital_status?: string | null
          meter_number?: string | null
          name: string
          occupancy_count?: number | null
          owner_id: string
          phone: string
          profile_url?: string | null
          security_deposit?: number | null
          total_arrears_balance?: number | null
        }
        Update: {
          aadhar_number?: string | null
          address?: string | null
          advance_balance?: number | null
          checkout_date?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          employment_status?: string | null
          final_meter_reading?: number | null
          flat_id?: string | null
          gender?: string | null
          id?: string
          initial_meter_reading?: number | null
          is_active?: boolean | null
          join_date?: string | null
          marital_status?: string | null
          meter_number?: string | null
          name?: string
          occupancy_count?: number | null
          owner_id?: string
          phone?: string
          profile_url?: string | null
          security_deposit?: number | null
          total_arrears_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_flat_id_fkey"
            columns: ["flat_id"]
            isOneToOne: false
            referencedRelation: "flats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_advance_balance: {
        Args: {
          tenant_id: string
          increment_amount: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
