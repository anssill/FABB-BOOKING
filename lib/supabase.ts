// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon)

// Types matching our schema
export type Role = 'owner' | 'manager' | 'counter' | 'wash'

export interface Profile {
  id: string
  email: string
  name: string
  role: Role
  whatsapp?: string
  avatar_url?: string
  active: boolean
}

export interface Item {
  id: string
  name: string
  category: string
  sku?: string
  qty: number
  available: number
  daily_rate: number
  deposit: number
  description?: string
  sizes?: string
  alt_notes?: string
  status: 'active' | 'archived'
}

export interface Customer {
  id: string
  name: string
  phone: string
  phone2?: string
  phone2_type?: string
  phone3?: string
  phone3_type?: string
  email?: string
  company?: string
  address?: string
  city?: string
  state?: string
  id_type?: string
  id_number?: string
  id_expiry?: string
  id_photo_url?: string
  notes?: string
  created_at: string
}

export interface OrderLine {
  id: string
  order_id: string
  item_id?: string
  item_name: string
  qty: number
  days: number
  daily_rate: number
  subtotal: number
  alt_note?: string
}

export interface Order {
  id: string
  order_number: string
  type: 'order' | 'quote' | 'reservation'
  customer_id?: string
  start_date: string
  end_date: string
  status: 'concept' | 'reserved' | 'active' | 'returned' | 'cancelled'
  subtotal: number
  discount: number
  discount_type: 'flat' | 'pct'
  penalty: number
  penalty_paid: boolean
  total: number
  deposit: number
  deposit_method?: string
  deposit_paid: boolean
  deposit_ref?: string
  notes?: string
  created_at: string
  // Joined fields
  customer_name?: string
  customer_phone?: string
  customer_phone2?: string
  customer_id_type?: string
  customer_id_number?: string
  lines?: OrderLine[]
}

export interface WashEntry {
  id: string
  order_id?: string
  item_id?: string
  item_name: string
  customer_name?: string
  returned_date: string
  stage: 'Pending Wash' | 'Washing' | 'Drying' | 'Ironing' | 'Ready' | 'In Stock'
  staff?: string
  notes?: string
}

// Permission helpers
export const canWrite = (role: Role) => ['owner','manager'].includes(role)
export const canOrders = (role: Role) => ['owner','manager','counter'].includes(role)
export const canWash = (role: Role) => ['owner','manager','wash'].includes(role)
export const canSettings = (role: Role) => role === 'owner'
