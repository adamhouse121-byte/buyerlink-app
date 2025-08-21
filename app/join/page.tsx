"use client";

import { useState } from "react";

export default function JoinPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    // Post to the existing maker endpoint but mark it as open
    const r = await fetch("/api/maker?open=1", { method: "POST", body: fd });
    setBusy(false);

    let json: any = null;
    try { json = await r.json(); } catch {}

    if (!r.ok) {
      setMsg(json?.error || "Could not create your link.");
      return;
    }

    // Try to route the user somewhere useful after creation
    if (json?.agent_id) {
      window.location.assign(`/a/${json.agent_id}/settings`);
      return;
    }
    if (json?.form_id) {
      window.location.assign(`/form/${json.form_id}`);
      return;
    }
    // Fallback:
    setMsg("Created! If you weren’t redirected, refresh the page.");
  }

  return (
    <main style={{ maxWidth: 640, margin: "32px auto", padding: "0 16px" }}>
      <h1>Create your Buyer Preference link</h1>
      <p>Free plan: 1 form, 15 responses/month. Upgrade anytime.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Agent email
          <input name="email" type="email" required placeholder="you@company.com" />
        </label>

        <label>
          Display name
          <input name="display_name" type="text" required placeholder="Your name / team" />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Brand color (hex)
            <input name="brand_color" type="text" defaultValue="#2E5BFF" />
          </label>
          <label>
            Logo URL (optional)
            <input name="logo_url" type="url" placeholder="https://…/logo.png" />
          </label>
        </div>

        <button disabled={busy} className="btn btn-primary" type="submit">
          {busy ? "Creating…" : "Create my link"}
        </button>

        {msg ? <p style={{ color: "crimson" }}>{msg}</p> : null}
      </form>
    </main>
  );
}
