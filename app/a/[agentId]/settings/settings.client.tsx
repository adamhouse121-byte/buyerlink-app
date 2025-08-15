"use client";
import { useState } from "react";
type Agent = { id:string; display_name:string|null; email:string|null; brand_color:string|null; logo_url:string|null };
type Form = { id:string; name:string|null };

export default function SettingsClient({ agent, forms }:{agent:Agent|null; forms:Form[]}) {
  if (!agent) return <main><h1>Settings</h1><p>Agent not found.</p></main>;

  const [display_name, setName] = useState(agent.display_name || "");
  const [email, setEmail] = useState(agent.email || "");
  const [brand_color, setColor] = useState(agent.brand_color || "#2E5BFF");
  const [logo_url, setLogo] = useState(agent.logo_url || "");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const form = forms[0];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch(`/api/a/${agent.id}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd, display_name, email, brand_color, logo_url }),
    });
    const j = await r.json();
    setMsg(r.ok ? "Saved!" : (j.error || "Save failed"));
  }

  return (
    <main style={{maxWidth:720, margin:"40px auto"}}>
      <h1>Agent Settings</h1>
      <p>
        Quick links:{" "}
        {form && <a href={`/form/${form.id}`}>Form</a>}{" · "}
        <a href={`/a/${agent.id}/inbox`}>Inbox</a>{" · "}
        <a href={`/api/a/${agent.id}/export`}>Download CSV</a>
      </p>

      <form onSubmit={save}>
        <label>Console password (MAKER_PASSWORD)<br/>
          <input value={pwd} onChange={e=>setPwd(e.target.value)} required/>
        </label><br/><br/>

        <label>Display name<br/>
          <input value={display_name} onChange={e=>setName(e.target.value)} required/>
        </label><br/><br/>

        <label>Email<br/>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </label><br/><br/>

        <label>Brand color (hex)<br/>
          <input value={brand_color} onChange={e=>setColor(e.target.value)}/>
        </label><br/><br/>

        <label>Logo URL<br/>
          <input value={logo_url} onChange={e=>setLogo(e.target.value)} placeholder="https://.../logo.png"/>
        </label><br/><br/>

        <button type="submit">Save</button>
        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </form>

      {logo_url && <div style={{marginTop:20}}>
        <p>Preview:</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="logo" src={logo_url} style={{maxHeight:64}} />
      </div>}
    </main>
  );
}
