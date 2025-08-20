// app/join/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function JoinPage() {
  const qs = useSearchParams();
  const codeFromLink = qs.get("code") || "";
  const [code, setCode] = useState(codeFromLink);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [brandColor, setBrandColor] = useState("#2E5BFF");
  const [logoUrl, setLogoUrl] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [msg, setMsg] = useState<string | null>(null);
  const [links, setLinks] = useState<null | {
    formUrl: string;
    inboxUrl: string;
    settingsUrl: string;
  }>(null);
  const disabled = useMemo(
    () => !email || !displayName || !code,
    [email, displayName, code]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Creating your account…");
    setLinks(null);

    const r = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email, display_name: displayName, brand_color: brandColor, logo_url: logoUrl, plan }),
    });

    const j = await r.json();
    if (!r.ok) {
      setMsg(j.error || "Something went wrong.");
      return;
    }
    setMsg("Success! Save these links:");
    setLinks({ formUrl: j.formUrl, inboxUrl: j.inboxUrl, settingsUrl: j.settingsUrl });
  };

  return (
    <main style={{ maxWidth: 680, margin: "40px auto", padding: "0 16px" }}>
      <div style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 24,
        boxShadow: "0 6px 20px rgba(0,0,0,.06)"
      }}>
        <h1 style={{ margin: "0 0 8px 0" }}>Join Buyer Preference Link</h1>
        <p style={{ marginTop: 0, color: "#555" }}>
          Enter your info to get your personal form & inbox.
        </p>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Access code</div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Provided by admin"
              style={inp}
            />
          </label>

          <label>
            <div>Agent email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@broker.com"
              style={inp}
            />
          </label>

          <label>
            <div>Agent display name</div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              style={inp}
            />
          </label>

          <label>
            <div>Plan</div>
            <select value={plan} onChange={(e) => setPlan(e.target.value as any)} style={inp}>
              <option value="free">free</option>
              <option value="pro">pro</option>
            </select>
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

          <button disabled={disabled} style={btn(disabled)}>Create my account</button>
        </form>

        {msg && <p style={{ marginTop: 14 }}>{msg}</p>}

        {links && (
          <ul style={{ lineHeight: 1.8 }}>
            <li><a href={links.formUrl} target="_blank">Buyer form</a></li>
            <li><a href={links.inboxUrl} target="_blank">Inbox</a></li>
            <li><a href={links.settingsUrl} target="_blank">Settings</a></li>
          </ul>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, opacity: .7 }}>
        Tip: You can prefill the access code in links you send, e.g. <code>/join?code=YOURCODE</code>
      </p>
    </main>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  outline: "none",
};

const btn = (disabled: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid transparent",
  background: disabled ? "#9CA3AF" : "#2E5BFF",
  color: "white",
  cursor: disabled ? "not-allowed" : "pointer",
});
