// app/api/downloadFile/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `attachment; filename="${url.split('/').pop()}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: 'Failed to download file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
