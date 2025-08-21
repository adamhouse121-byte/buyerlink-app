// /app/signup/page.tsx
"use client";

import { useState, useMemo } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [brandColor, setBrandColor] = useState("#2E5BFF");
  const [logoUrl, setLogoUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [links, setLinks] = useState<null | { formUrl: string; inboxUrl: string; settingsUrl: string }>(null);

  const disabled = useMemo(() => !email || !displayName, [email, displayName]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Creating your account…");
    setLinks(null);

    const r = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, display_name: displayName, brand_color: brandColor, logo_url: logoUrl }),
    });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || "Something went wrong."); return; }

    setMsg("Success! Save these links:");
    setLinks({ formUrl: j.formUrl, inboxUrl: j.inboxUrl, settingsUrl: j.settingsUrl });
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ margin: "0 0 6px" }}>Create your Buyer Preference link</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Free plan: 1 form, 15 responses/month. Upgrade anytime.</p>

      <form onSubmit={submit} style={{ display: "grid", gap: 12, border: "1px solid #eee", borderRadius: 12, padding: 18 }}>
        <label>
          <div>Agent email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@broker.com" style={inp} />
        </label>
        <label>
          <div>Display name</div>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jane Doe" style={inp} />
        </label>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <label>
            <div>Brand color</div>
            <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={inp} />
          </label>
          <label>
            <div>Logo URL (optional)</div>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…/logo.png" style={inp} />
          </label>
        </div>
        <button disabled={disabled} style={btn(disabled)}>Create my link</button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      {links && (
        <ul style={{ lineHeight: 1.8 }}>
          <li><a href={links.formUrl} target="_blank">Buyer form</a></li>
          <li><a href={links.inboxUrl} target="_blank">Inbox</a></li>
          <li><a href={links.settingsUrl} target="_blank">Settings</a></li>
        </ul>
      )}
    </main>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
};

const btn = (disabled: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid transparent",
  background: disabled ? "#9CA3AF" : "#2E5BFF",
  color: "white",
  cursor: disabled ? "not-allowed" : "pointer",
});
