"use client";

import React, { useState } from "react";

type Props = { formId: string; accent: string };

const inp: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
};

const pillStyle = (active: boolean, accent: string): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: active ? `2px solid ${accent}` : "1px solid #d1d5db",
  background: "#fff",
  color: "#111",
  fontSize: 14,
  cursor: "pointer",
});

const tileStyle = (active: boolean, accent: string): React.CSSProperties => ({
  padding: 14,
  textAlign: "center",
  borderRadius: 12,
  border: active ? `2px solid ${accent}` : "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
});

/* -------------- Small helpers -------------- */
function formatAmount(input: string): number | null {
  // supports "300000", "$300,000", "300k" or "300 K"
  const m = input.trim().match(/^\$?\s*([\d,\.]+)\s*([kK])?\s*$/);
  if (!m) return null;
  const raw = m[1].replace(/[,]/g, "");
  const num = Number(raw);
  if (Number.isNaN(num)) return null;
  return m[2] ? Math.round(num * 1000) : Math.round(num);
}

function formatPriceRangePretty(value: string): string {
  // Find up to two amounts in the string
  const parts = Array.from(value.matchAll(/\$?\s*[\d,\.]+\s*[kK]?/g)).map((m) => m[0]);
  const amounts = parts.map(formatAmount).filter((n): n is number => n !== null);
  if (amounts.length === 0) return value;
  const fmt = new Intl.NumberFormat("en-US");
  if (amounts.length === 1) return `$${fmt.format(amounts[0])}`;
  const [a, b] = [Math.min(amounts[0], amounts[1]), Math.max(amounts[0], amounts[1])];
  return `$${fmt.format(a)} – $${fmt.format(b)}`;
}

/* -------------- Pickers -------------- */
function BedsPicker({ onChange, accent }: { onChange: (v: string) => void; accent: string }) {
  const labels = ["Any", "Studio", "1", "2", "3", "4", "5+"] as const;
  const [start, setStart] = useState<number | null>(0); // "Any" selected
  const [end, setEnd] = useState<number | null>(null);
  const [val, setVal] = useState<string>("Any");

  const commit = (s: number | null, e: number | null) => {
    let v = "Any";
    if (s !== null && e === null) v = labels[s];
    else if (s !== null && e !== null) {
      const a = Math.min(s, e);
      const b = Math.max(s, e);
      const L = labels[a];
      const R = labels[b];
      v = a === b ? (typeof L === "string" ? L : String(L)) : `${L}–${R}`;
    }
    setVal(v);
    onChange(v);
  };

  const clickIdx = (i: number) => {
    if (i === 0) {
      setStart(0); setEnd(null); commit(0, null); return;
    }
    if (start === null || start === 0) { setStart(i); setEnd(null); commit(i, null); }
    else if (end === null) { setEnd(i); commit(start, i); }
    else { setStart(i); setEnd(null); commit(i, null); }
  };

  const isActive = (i: number) =>
    (start !== null && end === null && i === start) ||
    (start !== null && end !== null && i >= Math.min(start, end) && i <= Math.max(start, end)) ||
    (i === 0 && start === 0 && end === null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <b>Beds</b>
        <small style={{ opacity: 0.7 }}>Tap two numbers to select a range</small>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {labels.map((label, i) => (
          <button key={label} type="button" onClick={() => clickIdx(i)} aria-pressed={isActive(i)}
            style={pillStyle(isActive(i), accent)}>
            {label}
          </button>
        ))}
      </div>
      <input type="hidden" name="beds" value={val} />
    </div>
  );
}

function BathsPicker({ onChange, accent }: { onChange: (v: string) => void; accent: string }) {
  const opts = ["Any", "1+", "1.5+", "2+", "2.5+", "3+", "4+"] as const;
  const [val, setVal] = useState<string>("Any");
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 6 }}><b>Baths</b></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {opts.map((o) => (
          <button key={o} type="button" onClick={() => { setVal(o); onChange(o); }}
            aria-pressed={val === o} style={pillStyle(val === o, accent)}>
            {o}
          </button>
        ))}
      </div>
      <input type="hidden" name="baths" value={val} />
    </div>
  );
}

function HomeTypePicker({ onChange, accent }: { onChange: (keys: string[]) => void; accent: string }) {
  const options = [
    { key: "house", label: "House", icon: "🏠" },
    { key: "townhouse", label: "Townhouse", icon: "🏘️" },
    { key: "condo", label: "Condo", icon: "🏢" },
    { key: "land", label: "Land", icon: "🌳" },
    { key: "multi", label: "Multi-family", icon: "🏘️" },
    { key: "mobile", label: "Mobile", icon: "🚚" },
    { key: "coop", label: "Co-op", icon: "🤝" },
    { key: "other", label: "Other", icon: "🏰" },
  ] as const;

  const [sel, setSel] = useState<string[]>([]);
  const toggle = (k: string) => {
    const next = sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k];
    setSel(next); onChange(next);
  };
  const reset = () => { setSel([]); onChange([]); };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 6 }}><b>Home Type</b></div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        {options.map((o) => {
          const active = sel.includes(o.key);
          return (
            <button key={o.key} type="button" onClick={() => toggle(o.key)} aria-pressed={active}
              style={tileStyle(active, accent)}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{o.icon}</div>
              <div>{o.label}</div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={reset}
          style={{ background: "none", border: "none", color: accent, textDecoration: "underline", padding: 0 }}>
          Reset
        </button>
      </div>
      <input type="hidden" name="home_types" value={sel.length ? sel.join(", ") : "Any"} />
    </div>
  );
}

/* -------------- Main Form -------------- */
export default function ClientForm({ formId, accent }: Props) {
  const [beds, setBeds] = useState("Any");
  const [baths, setBaths] = useState("Any");
  const [types, setTypes] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");

  const onPriceBlur = () => setPrice(formatPriceRangePretty(price));

  return (
    <form method="post" action="/api/submit" style={{ display: "grid", gap: 14 }}>
      <input type="hidden" name="form_id" value={formId} />
      {/* keep the old 'contact' for the backend email; use the email value */}
      <input type="hidden" name="contact" value={email} />
      {/* store phone as its own field too */}
      <input type="hidden" name="phone" value={phone} />

      <label>
        Full name
        <br />
        <input name="full_name" required style={inp} />
      </label>

      <div style={{display:"grid", gap:10, gridTemplateColumns:"1fr 1fr"}}>
        <label>
          Email
          <br />
          <input name="email" type="email" placeholder="name@email.com"
                 value={email} onChange={(e)=>setEmail(e.target.value)} style={inp} />
        </label>
        <label>
          Phone
          <br />
          <input name="phone_display" placeholder="(555) 555-5555"
                 value={phone} onChange={(e)=>setPhone(e.target.value)} style={inp} />
        </label>
      </div>

      <label>
        Timeline
        <br />
        <select name="timeline" style={inp}>
          <option>Under 3 months</option>
          <option>3–6 months</option>
          <option>6–18 months</option>
          <option>2+ years</option>
        </select>
      </label>

      <label>
        Price range
        <br />
        <input name="price_range" placeholder="$300,000 – $400,000"
               value={price} onChange={(e)=>setPrice(e.target.value)} onBlur={onPriceBlur}
               style={inp} />
      </label>

      <label>
        Loan type
        <br />
        <select name="loan_type" style={inp}>
          <option>Conventional</option>
          <option>FHA</option>
          <option>VA</option>
          <option>Cash</option>
          <option>Other</option>
        </select>
      </label>

      <BedsPicker onChange={setBeds} accent={accent} />
      <BathsPicker onChange={setBaths} accent={accent} />
      <HomeTypePicker onChange={setTypes} accent={accent} />

      <label>
        Parking
        <br />
        <select name="parking" style={inp}>
          <option>Street ok</option>
          <option>1-car</option>
          <option>2-car</option>
          <option>3+</option>
        </select>
      </label>

      <label>
        Basement
        <br />
        <select name="basement" style={inp}>
          <option value="must">Must have</option>
          <option value="nice">Nice to have</option>
          <option value="ok">No basement OK</option>
        </select>
      </label>

      <label>
        Yard
        <br />
        <select name="yard" style={inp}>
          <option value="none">None OK</option>
          <option value="small">Small OK</option>
          <option value="needs">Needs usable yard</option>
        </select>
      </label>

      <label>
        Condition
        <br />
        <select name="condition" style={inp}>
          <option value="turnkey">Turn-key only</option>
          <option value="light">Light updates OK</option>
          <option value="project">Project OK</option>
        </select>
      </label>

      <label>
        Must-haves
        <br />
        <input name="must_haves" placeholder="pool, shed" style={inp} />
      </label>

      <label>
        Dealbreakers
        <br />
        <input name="dealbreakers" placeholder="busy road, HOA" style={inp} />
      </label>

      <label>
        Areas
        <br />
        <input name="areas" placeholder="Orland Park, Crown Point" style={inp} />
      </label>

      <label>
        Max commute (min)
        <br />
        <input type="number" name="max_commute" style={inp} />
      </label>

      <label>
        Notes
        <br />
        <textarea name="notes" rows={4} style={{ ...inp, height: "auto" }} />
      </label>

      <button
        type="submit"
        style={{ padding: "12px 16px", borderRadius: 10, background: accent, color: "#fff", border: "none", fontWeight: 600 }}
      >
        Share Preferences
      </button>
    </form>
  );
}
