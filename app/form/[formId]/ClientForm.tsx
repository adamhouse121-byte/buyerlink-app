"use client";

import React, { useState } from "react";

type Props = { formId: string; accent: string };

const inp: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
};

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 8,
  border: active ? "2px solid #2563eb" : "1px solid #d1d5db",
  background: active ? "#eff6ff" : "#fff",
  color: "#111",
  fontSize: 14,
  cursor: "pointer",
});

const tileStyle = (active: boolean): React.CSSProperties => ({
  padding: 14,
  textAlign: "center",
  borderRadius: 12,
  border: active ? "2px solid #2563eb" : "1px solid #e5e7eb",
  background: active ? "#eff6ff" : "#fff",
  cursor: "pointer",
});

function BedsPicker({ onChange }: { onChange: (v: string) => void }) {
  const labels = ["Studio", "1", "2", "3", "4", "5+"] as const;
  const [start, setStart] = useState<number | null>(null);
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
      v = a === b ? L : `${L}–${R}`;
    }
    setVal(v);
    onChange(v);
  };

  const clickAny = () => {
    setStart(null);
    setEnd(null);
    commit(null, null);
  };

  const clickIdx = (i: number) => {
    if (start === null) {
      setStart(i);
      setEnd(null);
      commit(i, null);
    } else if (end === null) {
      setEnd(i);
      commit(start, i);
    } else {
      setStart(i);
      setEnd(null);
      commit(i, null);
    }
  };

  const isActive = (i: number) =>
    (start !== null && end === null && i === start) ||
    (start !== null && end !== null && i >= Math.min(start, end) && i <= Math.max(start, end));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <b>Beds</b>
        <small style={{ opacity: 0.7 }}>Tap two numbers to select a range</small>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={clickAny} aria-pressed={val === "Any"} style={pillStyle(val === "Any")}>
          Any
        </button>
        {labels.map((label, i) => (
          <button key={label} type="button" onClick={() => clickIdx(i)} aria-pressed={isActive(i)} style={pillStyle(isActive(i))}>
            {label}
          </button>
        ))}
      </div>
      <input type="hidden" name="beds" value={val} />
    </div>
  );
}

function BathsPicker({ onChange }: { onChange: (v: string) => void }) {
  const opts = ["Any", "1+", "1.5+", "2+", "2.5+", "3+", "4+"] as const;
  const [val, setVal] = useState<string>("Any");
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 6 }}>
        <b>Baths</b>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {opts.map((o) => (
          <button key={o} type="button" onClick={() => { setVal(o); onChange(o); }} aria-pressed={val === o} style={pillStyle(val === o)}>
            {o}
          </button>
        ))}
      </div>
      <input type="hidden" name="baths" value={val} />
    </div>
  );
}

function HomeTypePicker({ onChange }: { onChange: (keys: string[]) => void }) {
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
    setSel(next);
    onChange(next);
  };

  const reset = () => {
    setSel([]);
    onChange([]);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 6 }}>
        <b>Home Type</b>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        {options.map((o) => {
          const active = sel.includes(o.key);
          return (
            <button key={o.key} type="button" onClick={() => toggle(o.key)} aria-pressed={active} style={tileStyle(active)}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{o.icon}</div>
              <div>{o.label}</div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={reset} style={{ background: "none", border: "none", color: "#2563eb", textDecoration: "underline", padding: 0 }}>
          Reset
        </button>
      </div>
      <input type="hidden" name="home_types" value={sel.length ? sel.join(", ") : "Any"} />
    </div>
  );
}

export default function ClientForm({ formId, accent }: Props) {
  const [beds, setBeds] = useState("Any");
  const [baths, setBaths] = useState("Any");
  const [types, setTypes] = useState<string[]>([]);

  return (
    <form method="post" action="/api/submit" style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="form_id" value={formId} />

      <label>
        Full name
        <br />
        <input name="full_name" required style={inp} />
      </label>

      <label>
        Contact
        <br />
        <input name="contact" placeholder="email or phone" style={inp} />
      </label>

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
        <input name="price_range" placeholder="$300–400k" style={inp} />
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

      <BedsPicker onChange={setBeds} />
      <BathsPicker onChange={setBaths} />
      <HomeTypePicker onChange={setTypes} />

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
        <input name="must_haves" placeholder="basement, 2-car" style={inp} />
      </label>

      <label>
        Dealbreakers
        <br />
        <input name="dealbreakers" placeholder="busy road" style={inp} />
      </label>

      <label>
        Areas
        <br />
        <input name="areas" placeholder="Crown Point, Cedar Lake" style={inp} />
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

      <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, background: accent, color: "#fff", border: "none" }}>
        Send
      </button>
    </form>
  );
}
