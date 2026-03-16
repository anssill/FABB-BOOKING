// app/api/email/send/route.ts — Send transactional emails via Resend
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { to, template, data, orderId, customerId } = body

    if (!to || !template) {
      return NextResponse.json({ error: 'Missing required fields: to, template' }, { status: 400 })
    }

    // Get API key from settings
    const { data: settings } = await supabase.from('settings').select('resend_api_key, biz_name').single()
    const apiKey = settings?.resend_api_key
    if (!apiKey) {
      return NextResponse.json({ error: 'Email not configured. Add Resend API key in Settings → Integrations.' }, { status: 400 })
    }

    const result = await sendEmail({
      to,
      template,
      data: { ...data, businessName: settings?.biz_name },
      apiKey,
      orderId,
      customerId,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Log to email_log
    await supabase.from('email_log').insert({
      to_email: to,
      template,
      subject: template,
      order_id: orderId || null,
      customer_id: customerId || null,
      sent_by: session.user.id,
      status: 'sent',
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
