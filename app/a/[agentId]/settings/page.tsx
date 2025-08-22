// app/a/[agentId]/settings/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// No server-side data; just a client form to resend the secure link.
import * as React from 'react';

function ResendForm() {
  'use client';

  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = React.useState<string>('');

  async function send() {
    if (!email) return;
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch(`/api/agents/send-links?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      if (res.ok) {
        setStatus('sent');
        setMessage('Secure link sent. Check your inbox.');
      } else {
        const j = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(j?.error || 'Failed to send. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Enter your email to resend the secure settings link:
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="you@example.com"
          style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8, minWidth: 260 }}
        />
        <button
          onClick={send}
          disabled={!email || status === 'sending'}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 12, background: '#fff' }}
        >
          {status === 'sending' ? 'Sending…' : 'Resend secure link'}
        </button>
      </div>
      {message && (
        <p style={{ marginTop: 8, color: status === 'error' ? '#ef4444' : '#16a34a' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default function MovedSettingsPage() {
  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>This settings page has moved</h1>
      <p style={{ color: '#555' }}>
        We now use password-less access. Use the form below to have your secure settings link emailed to you.
      </p>
      <ResendForm />
      <p style={{ color: '#777', marginTop: 12, fontSize: 13 }}>
        Tip: once you open the email, bookmark the settings link for next time.
      </p>
    </div>
  );
}
