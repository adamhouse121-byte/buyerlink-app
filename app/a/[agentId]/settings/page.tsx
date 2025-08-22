export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('id, email')
    .eq('id', agentId)
    .maybeSingle();

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>This settings page has moved</h1>

      {!agent ? (
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
