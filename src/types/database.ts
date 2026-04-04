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
          profile_url: string | null
          upi_id: string | null
          upi_qr_url: string | null
          preferred_lang: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          profile_url?: string | null
          upi_id?: string | null
          upi_qr_url?: string | null
          preferred_lang?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          profile_url?: string | null
          upi_id?: string | null
          upi_qr_url?: string | null
          preferred_lang?: string
          created_at?: string
        }
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
      }
      flats: {
        Row: {
          id: string
          building_id: string
          flat_code: string
          floor: number | null
          rent_amount: number
          is_occupied: boolean
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          building_id: string
          flat_code: string
          floor?: number | null
          rent_amount: number
          is_occupied?: boolean
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          flat_code?: string
          floor?: number | null
          rent_amount?: number
          is_occupied?: boolean
          status?: string
          created_at?: string
        }
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
          aadhar_number: string | null
          gender: string | null
          marital_status: string | null
          employment_status: string | null
          occupancy_count: number
          initial_meter_reading: number
          final_meter_reading: number
          advance_balance: number
          total_arrears_balance: number
          is_active: boolean
          profile_url: string | null
          address: string | null
          created_at: string
          emergency_contact: string | null
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
          aadhar_number?: string | null
          gender?: string | null
          marital_status?: string | null
          employment_status?: string | null
          occupancy_count?: number
          initial_meter_reading?: number
          final_meter_reading?: number
          advance_balance?: number
          total_arrears_balance?: number
          is_active?: boolean
          profile_url?: string | null
          address?: string | null
          created_at?: string
          emergency_contact?: string | null
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
          aadhar_number?: string | null
          gender?: string | null
          marital_status?: string | null
          employment_status?: string | null
          occupancy_count?: number
          initial_meter_reading?: number
          final_meter_reading?: number
          advance_balance?: number
          total_arrears_balance?: number
          is_active?: boolean
          profile_url?: string | null
          address?: string | null
          created_at?: string
          emergency_contact?: string | null
        }
      }
      bills: {
        Row: {
          id: string
          tenant_id: string
          billing_month: string
          current_reading_date: string
          previous_reading: number
          current_reading: number
          units_consumed: number | null
          electricity_amount: number
          rent_amount: number
          paid_amount: number
          remaining_balance: number
          arrears_included: number
          advance_applied: number
          total_amount: number
          status: string
          is_paid: boolean
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          billing_month: string
          current_reading_date?: string
          previous_reading: number
          current_reading: number
          electricity_amount: number
          rent_amount: number
          paid_amount?: number
          remaining_balance?: number
          arrears_included?: number
          advance_applied?: number
          total_amount: number
          status?: string
          is_paid?: boolean
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          billing_month?: string
          current_reading_date?: string
          previous_reading?: number
          current_reading?: number
          electricity_amount?: number
          rent_amount?: number
          paid_amount?: number
          remaining_balance?: number
          arrears_included?: number
          advance_applied?: number
          total_amount?: number
          status?: string
          is_paid?: boolean
          pdf_url?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          tenant_id: string
          name: string
          file_url: string
          file_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          file_url: string
          file_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          file_url?: string
          file_type?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      increment_tenant_advance: {
        Args: {
          t_id: string
          amount: number
        }
        Returns: void
      }
    }
  }
}
