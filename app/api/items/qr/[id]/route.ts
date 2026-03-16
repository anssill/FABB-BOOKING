// app/api/items/qr/[id]/route.ts — Generate QR code PNG for item
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import QRCode from 'qrcode'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: item } = await supabase.from('items').select('id,sku,name').eq('id', params.id).single()
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    const qrData = JSON.stringify({ id: item.id, sku: item.sku || '', name: item.name })
    const buffer = await QRCode.toBuffer(qrData, {
      width: 300,
      margin: 3,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
