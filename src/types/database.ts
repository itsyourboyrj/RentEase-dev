export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      owners: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      buildings: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string | null
          electricity_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address?: string | null
          electricity_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string | null
          electricity_rate?: number
          created_at?: string
        }
        Relationships: []
      }
      flats: {
        Row: {
          id: string
          building_id: string
          flat_code: string
          floor: number | null
          rent_amount: number
          is_occupied: boolean
          created_at: string
        }
        Insert: {
          id?: string
          building_id: string
          flat_code: string
          floor?: number | null
          rent_amount: number
          is_occupied?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          flat_code?: string
          floor?: number | null
          rent_amount?: number
          is_occupied?: boolean
          created_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          id: string
          flat_id: string | null
          owner_id: string
          name: string
          phone: string
          email: string | null
          join_date: string | null
          checkout_date: string | null
          security_deposit: number | null
          meter_number: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          flat_id?: string | null
          owner_id: string
          name: string
          phone: string
          email?: string | null
          join_date?: string | null
          checkout_date?: string | null
          security_deposit?: number | null
          meter_number?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          flat_id?: string | null
          owner_id?: string
          name?: string
          phone?: string
          email?: string | null
          join_date?: string | null
          checkout_date?: string | null
          security_deposit?: number | null
          meter_number?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          id: string
          tenant_id: string
          billing_month: string
          previous_reading: number
          current_reading: number
          units_consumed: number | null
          electricity_amount: number
          rent_amount: number
          total_amount: number
          is_paid: boolean
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          billing_month: string
          previous_reading: number
          current_reading: number
          electricity_amount: number
          rent_amount: number
          total_amount: number
          is_paid?: boolean
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          billing_month?: string
          previous_reading?: number
          current_reading?: number
          electricity_amount?: number
          rent_amount?: number
          total_amount?: number
          is_paid?: boolean
          pdf_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
