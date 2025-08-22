import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { SignJWT } from 'jose';

export const runtime = 'nodejs';

function secret() {
  const s = process.env.MAGIC_LINK_SECRET;
  if (!s) throw new Error('Missing env: MAGIC_LINK_SECRET');
  return new TextEncoder().encode(s);
}

function appBase() {
  return process.env.APP_URL || 'https://app.buyerpref.link';
}

async function signToken(payload: Record<string, any>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(secret());
}

async function sendEmail(to: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey) throw new Error('Missing env: RESEND_API_KEY');
  if (!from) throw new Error('Missing env: EMAIL_FROM');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Your secure BuyerPref settings link',
      html: `<p>Hi,</p>
             <p>Use your secure settings link below (valid for 30 minutes):</p>
             <p><a href="${url}">${url}</a></p>
             <p>If you didn’t request this, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${text}`);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId') || '';
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('id,email,display_name,slug,is_pro,plan')
      .eq('id', agentId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const token = await signToken({ scope: 'settings', sub: data.id });
    const link = new URL('/agent/settings', appBase());
    link.searchParams.set('token', token);

    await sendEmail(data.email, link.toString());

    // Mask email lightly
    const masked = data.email.replace(/(.{2}).+(@.+)/, '$1******$2');
    return NextResponse.json({ ok: true, message: `Secure link sent to ${masked}.` });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
