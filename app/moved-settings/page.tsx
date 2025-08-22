'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type Status = 'idle' | 'sending' | 'sent' | 'error';

function MovedSettingsInner() {
  const params = useSearchParams();
  const agentId = params.get('agentId') || '';

  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');
  const [message, setMessage] = React.useState('');

  const isSending = status === 'sending';
  const isSent = status === 'sent';
  const isError = status === 'error';
  const isIdle = status === 'idle';

  // Auto-send if agentId present
  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!agentId) return;
      setStatus('sending');
      setMessage('');
      try {
        const res = await fetch(
          `/api/agents/send-links-by-id?agentId=${encodeURIComponent(agentId)}`
        );
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.error || 'Failed');
        if (!cancelled) {
          setStatus('sent');
          setMessage(j?.message || 'Secure link sent. Check your inbox.');
        }
      } catch (e: any) {
        if (!cancelled) {
          setStatus('error');
          setMessage(e?.message || 'Failed to send. Please try again.');
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  async function sendByEmail() {
    if (!email) return;
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch(`/api/agents/send-links?email=${encodeURIComponent(email)}`);
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setStatus('sent');
      setMessage(j?.message || 'Secure link sent. Check your inbox.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Failed to send. Please try again.');
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
        This settings page has moved
      </h1>

      {isSending && <p style={{ color: '#555' }}>Sending your secure settings link…</p>}

      {isSent && <p style={{ color: '#16a34a' }}>{message}</p>}

      {(isError || isIdle) && (
        <>
          {isError && (
            <p style={{ color: '#ef4444', marginBottom: 8 }}>{message || 'Failed to send.'}</p>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="you@example.com"
              style={{
                padding: 8,
                border: '1px solid #d1d5db',
                borderRadius: 8,
                minWidth: 260,
              }}
            />
            <button
              onClick={sendByEmail}
              disabled={!email || isSending}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 12,
                background: '#fff',
              }}
            >
              {isSending ? 'Sending…' : isIdle ? 'Send secure link' : 'Resend secure link'}
            </button>
          </div>

          <p style={{ color: '#777', marginTop: 12, fontSize: 13 }}>
            Tip: once you open the email, bookmark the settings link for next time.
          </p>
        </>
      )}
    </div>
  );
}

export default function Page() {
  // Required when using useSearchParams in a client page
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <MovedSettingsInner />
    </Suspense>
  );
}
