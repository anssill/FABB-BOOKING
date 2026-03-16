// lib/qrcode.ts — QR code generation for Fabb.booking items

export interface ItemQRData {
  id: string
  sku?: string
  name: string
}

export function formatItemQR(item: ItemQRData): string {
  return JSON.stringify({ id: item.id, sku: item.sku || '', name: item.name })
}

// Client-side: generate QR code data URL using qrcode library
export async function generateQRDataURL(data: string): Promise<string> {
  // Dynamic import so it works in both browser and server
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(data, {
    width: 200,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  })
}

// Generate QR for an item and return base64 data URL
export async function generateItemQR(item: ItemQRData): Promise<string> {
  const data = formatItemQR(item)
  return generateQRDataURL(data)
}
