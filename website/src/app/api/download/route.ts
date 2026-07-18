import { NextRequest, NextResponse } from 'next/server';
import { getZipBundle } from '@/lib/ota';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');

  if (!version) {
    return NextResponse.json({ error: 'Missing version parameter' }, { status: 400 });
  }

  try {
    const { buffer, contentType } = await getZipBundle(version);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `attachment; filename="web-build-${version}.zip"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error(`Download proxy error:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
