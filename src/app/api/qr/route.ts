import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  try {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#10b981',  // emerald-500
        light: '#00000000', // transparent background
      },
    });
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
