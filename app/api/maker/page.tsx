"use client";
import { useState } from "react";

export default function Maker() {
  const [pwd, setPwd] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("free");
  const [color, setColor] = useState("#2E5BFF");
  const [logo, setLogo] = useState("");
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setResult(null);
    const r = await fetch("/api/maker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: pwd,
        email,
        display_name: name,
        plan,
        brand_color: color,
        logo_url: logo,
      }),
    });
    const j = await r.json();
    if (!r.ok) setErr(j.error || "Failed");
    else setResult(j);
  }

  return (
    <main>
      <h1>Maker Console</h1>
      <form onSubmit={createAgent}>
        <label>Console password<br/><input value={pwd} onChange={e=>setPwd(e.target.value)} required/></label><br/>
        <label>Agent email<br/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><br/>
        <label>Agent display name<br/><input value={name} onChange={e=>setName(e.target.value)} required/></label><br/>
        <label>Plan<br/>
          <select value={plan} onChange={e=>setPlan(e.target.value)}>
            <option value="free">free</option>
            <option value="pro">pro</option>
          </select>
        </label><br/>
        <label>Brand color (hex)<br/><input value={color} onChange={e=>setColor(e.target.value)}/></label><br/>
        <label>Logo URL (optional)<br/><input value={logo} onChange={e=>setLogo(e.target.value)} placeholder="https://.../logo.png"/></label><br/><br/>
        <button type="submit">Create agent + form</button>
      </form>

      {err && <p style={{color:"crimson"}}>{err}</p>}
      {result?.ok && (
        <div style={{marginTop:16}}>
          <p><strong>Form link:</strong> <a href={result.form_url}>{result.form_url}</a></p>
          <p><strong>Settings:</strong> <a href={result.settings_url}>{result.settings_url}</a></p>
        </div>
      )}
    </main>
  );
}
