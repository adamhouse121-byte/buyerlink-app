import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true, env: !!process.env.APP_URL ? 'loaded' : 'missing APP_URL' });
}
