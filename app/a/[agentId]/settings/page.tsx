// app/a/[agentId]/settings/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// IMPORTANT: this page must run server-side only
import 'server-only';
import * as React from 'react';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client using service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { persistSession: false } }
);

function maskEmail(e: string) {
  const [u, d] = e.split('@');
  if (!d) return e;
  const shown = u.slice(0, 2);
  return `${shown}${'*'.repeat(Math.max(1, u.length - 2))}@${d}`;
}

function Resend({ email }: { email: string }) {
  'use client';
  const [state, setState] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  React.useEffect(() => {
    let cancelled = false;
    const send = async () => {
      try {
        setState('sending');
        await fetch(`/api/agents/send-links?email=${encodeURIComponent(email)}`);
        if (!cancelled) setState('sent');
      } catch {
        if (!cancelled) setState('error');
      }
    };
    // send once on load
    send();
    return () => { cancelled = true; };
  }, [email]);

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        onClick={async () => {
          try {
            setState('sending');
            await fetch(`/api/agents/send-links?email=${encodeURIComponent(email)}`);
            setState('sent');
          } catch {
            setState('error');
          }
        }}
        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 12, background: '#fff' }}
      >
        {state === 'sending' ? 'Sending…' : 'Resend secure link'}
      </button>
      {state === 'sent' && <span style={{ color: '#16a34a' }}>Sent ✔</span>}
      {state === 'error' && <span style={{ color: '#ef4444' }}>Failed to send. Try again.</span>}
    </div>
  );
}

export default async function LegacySettings({ params }: { params: { agentId: string } }) {
  const agentId = params.agentId;

  // Look up agent by ID to get their email
  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .select('id, email')
    .eq('id', agentId)
    .maybeSingle();

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>This settings page has moved</h1>

      {!agent || error ? (
        <p style={{ color: '#555' }}>
          The link you opened is no longer used. Please request your secure settings link by email.
        </p>
      ) : (
        <>
          <p style={{ color: '#555' }}>
            We’ve switched to password-less access. We just emailed your secure settings link to{' '}
            <strong>{maskEmail(agent.email)}</strong>. Open that email to manage your account.
          </p>
          <Resend email={agent.email} />
          <p style={{ color: '#777', marginTop: 12, fontSize: 13 }}>
            Tip: bookmark the settings link in that email for future use.
          </p>
        </>
      )}
    </div>
  );
}
