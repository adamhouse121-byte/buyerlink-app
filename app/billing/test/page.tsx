"use client";
import { useState } from "react";

export default function BillingTest() {
  const [agentId, setAgentId] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Creating checkout…");
    const r = await fetch("/api/billing/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agent_id: agentId, email }),
    });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || "error"); return; }
    window.location.href = j.url; // redirect to Stripe Checkout
  }

  return (
    <main style={{maxWidth: 520, margin: "40px auto", padding: 16}}>
      <h1>Billing Test</h1>
      <form onSubmit={go} style={{display:"grid", gap:12}}>
        <input placeholder="agent_id (UUID)" value={agentId} onChange={e=>setAgentId(e.target.value)} />
        <input placeholder="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button type="submit">Go to Checkout</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
