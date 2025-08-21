"use client";

import { useState } from "react";

export default function JoinPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/maker?open=1", { method: "POST", body: fd });
    setBusy(false);

    let json: any = null;
    try { json = await r.json(); } catch {}

    if (!r.ok) {
      setMsg(json?.error || "Could not create your link.");
      return;
    }

    if (json?.agent_id) {
      window.location.assign(`/a/${json.agent_id}/settings`);
      return;
    }
    if (json?.form_id) {
      window.location.assign(`/form/${json.form_id}`);
      return;
    }
    setMsg("Created! If you weren’t redirected, refresh the page.");
  }

  const wrap: React.CSSProperties = { maxWidth: 640, margin: "32px auto", padding: "0 16px" };
  const grid: React.CSSProperties = { display: "grid", gap: 12, marginTop: 16 };

  return (
    <main style={wrap}>
      <h1>Create your Buyer Preference link</h1>
      <p>Free plan: 1 form, 15 responses/month. Upgrade anytime.</p>

      <form onSubmit={onSubmit} style={grid}>
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

        {/* Plan selection */}
        <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 12 }}>
          <legend>Plan</legend>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginRight: 16 }}>
            <input type="radio" name="plan" value="free" defaultChecked /> Free
            <span style={{ opacity: 0.7 }}>(1 form, 15 responses/month)</span>
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input type="radio" name="plan" value="pro" /> Pro
            <span style={{ opacity: 0.7 }}>(unlimited forms, 100 responses/month, CSV export)</span>
          </label>
        </fieldset>

        <button disabled={busy} className="btn btn-primary" type="submit">
          {busy ? "Creating…" : "Create my link"}
        </button>

        {msg ? <p style={{ color: "crimson" }}>{msg}</p> : null}
      </form>
    </main>
  );
}
