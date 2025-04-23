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
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      departments: {
        Row: {
          id: string
          organization_id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string | null
          department_id: string | null
          full_name: string | null
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          organization_id?: string | null
          department_id?: string | null
          full_name?: string | null
          role: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          department_id?: string | null
          full_name?: string | null
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      processes: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          description: string | null
          department: string | null
          status: string
          created_by: string | null
          requires_approval: boolean | null
          approved_by: string | null
          approved_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          name: string
          description?: string | null
          department?: string | null
          status: string
          created_by?: string | null
          requires_approval?: boolean | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          name?: string
          description?: string | null
          department?: string | null
          status?: string
          created_by?: string | null
          requires_approval?: boolean | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}