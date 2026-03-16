// app/api/reports/export/route.ts — CSV export for reports
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

function toCSV(rows: Record<string, unknown>[], headers: string[]): string {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','))
  }
  return lines.join('\n')
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'orders'
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let csv = ''
    let filename = `${type}-export.csv`

    if (type === 'orders') {
      let query = supabase.from('orders_with_customer').select('*').order('created_at', { ascending: false })
      if (from) query = query.gte('start_date', from)
      if (to) query = query.lte('start_date', to)
      const { data } = await query
      const rows = (data || []).map(o => ({
        order_number: o.order_number,
        type: o.type,
        status: o.status,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        start_date: o.start_date,
        end_date: o.end_date,
        subtotal: o.subtotal,
        discount: o.discount,
        penalty: o.penalty,
        total: o.total,
        paid_amount: o.paid_amount,
        deposit: o.deposit,
        deposit_paid: o.deposit_paid,
        deposit_method: o.deposit_method,
        source: o.source,
        notes: o.notes,
        created_at: o.created_at,
      }))
      csv = toCSV(rows, ['order_number','type','status','customer_name','customer_phone','start_date','end_date','subtotal','discount','penalty','total','paid_amount','deposit','deposit_paid','deposit_method','source','notes','created_at'])
      filename = `orders-${new Date().toISOString().slice(0,10)}.csv`

    } else if (type === 'customers') {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
      const rows = (data || []).map(c => ({
        name: c.name,
        phone: c.phone,
        phone2: c.phone2,
        email: c.email,
        company: c.company,
        city: c.city,
        state: c.state,
        id_type: c.id_type,
        id_number: c.id_number,
        tags: (c.tags || []).join('; '),
        created_at: c.created_at,
      }))
      csv = toCSV(rows, ['name','phone','phone2','email','company','city','state','id_type','id_number','tags','created_at'])
      filename = `customers-${new Date().toISOString().slice(0,10)}.csv`

    } else if (type === 'inventory') {
      const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false })
      const rows = (data || []).map(i => ({
        name: i.name,
        category: i.category,
        sku: i.sku,
        barcode: i.barcode,
        qty: i.qty,
        available: i.available,
        rented: i.qty - i.available,
        daily_rate: i.daily_rate,
        deposit: i.deposit,
        min_rental_days: i.min_rental_days,
        status: i.status,
        sizes: i.sizes,
        description: i.description,
      }))
      csv = toCSV(rows, ['name','category','sku','barcode','qty','available','rented','daily_rate','deposit','min_rental_days','status','sizes','description'])
      filename = `inventory-${new Date().toISOString().slice(0,10)}.csv`

    } else if (type === 'revenue') {
      let query = supabase.from('orders').select('*').in('status', ['active','returned'])
      if (from) query = query.gte('start_date', from)
      if (to) query = query.lte('start_date', to)
      const { data } = await query
      // Group by month
      const monthly: Record<string, { month: string; orders: number; revenue: number; deposits: number; penalties: number }> = {}
      for (const o of (data || [])) {
        const month = (o.start_date || '').slice(0, 7)
        if (!monthly[month]) monthly[month] = { month, orders: 0, revenue: 0, deposits: 0, penalties: 0 }
        monthly[month].orders++
        monthly[month].revenue += Number(o.total) || 0
        monthly[month].deposits += o.deposit_paid ? Number(o.deposit) : 0
        monthly[month].penalties += Number(o.penalty) || 0
      }
      const rows = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month))
      csv = toCSV(rows as Record<string, unknown>[], ['month','orders','revenue','deposits','penalties'])
      filename = `revenue-${new Date().toISOString().slice(0,10)}.csv`
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
