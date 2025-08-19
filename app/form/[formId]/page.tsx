'use client';

import { useState } from 'react';

type BedsPickerProps = { onChange: (v: string) => void };
function BedsPicker({ onChange }: BedsPickerProps) {
  // we’ll encode as: "Any" | "Studio–3" | "2–4" | "5+" etc.
  const labels = ['Studio', '1', '2', '3', '4', '5+'] as const;
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [val, setVal] = useState<string>('Any');

  const commit = (s: number | null, e: number | null) => {
    let v = 'Any';
    if (s !== null && e === null) {
      // one tap only — show that single as temp value
      v = labels[s];
    } else if (s !== null && e !== null) {
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
      // start a new range
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
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6}}>
        <b>Beds</b>
        <small style={{opacity:.7}}>Tap two numbers to select a range</small>
      </div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button type="button" onClick={clickAny} aria-pressed={val==='Any'}
          style={pillStyle(val==='Any')}>Any</button>
        {labels.map((label, i) => (
          <button key={label} type="button" onClick={() => clickIdx(i)}
            aria-pressed={isActive(i)} style={pillStyle(isActive(i))}>
            {label}
          </button>
        ))}
      </div>
      {/* Hidden field that your API already expects */}
      <input type="hidden" name="beds" value={val}/>
    </div>
  );
}

type BathsPickerProps = { onChange: (v: string) => void };
function BathsPicker({ onChange }: BathsPickerProps) {
  const opts = ['Any','1+','1.5+','2+','2.5+','3+','4+'] as const;
  const [val, setVal] = useState<string>('Any');
  return (
    <div style={{marginTop:16}}>
      <div style={{marginBottom:6}}><b>Baths</b></div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {opts.map(o => (
          <button key={o} type="button" onClick={() => { setVal(o); onChange(o); }}
            aria-pressed={val===o} style={pillStyle(val===o)}>{o}</button>
        ))}
      </div>
      {/* Hidden field that your API already expects */}
      <input type="hidden" name="baths" value={val}/>
    </div>
  );
}

const pillStyle = (active:boolean): React.CSSProperties => ({
  padding:'8px 12px',
  borderRadius:8,
  border: active ? '2px solid #2563eb' : '1px solid #d1d5db',
  background: active ? '#eff6ff' : '#fff',
  color: '#111',
  fontSize:14,
  cursor:'pointer'
});

export default function F({ params }: { params: { formId: string } }) {
  const { formId } = params;
  const [beds, setBeds] = useState('Any');
  const [baths, setBaths] = useState('Any');

  return (
    <main style={{maxWidth:720, margin:'32px auto', padding:'0 16px'}}>
      <h1>Buyer Preferences</h1>
      <form method="post" action="/api/submit" style={{display:'grid', gap:12}}>
        <input type="hidden" name="form_id" value={formId}/>

        <label>Full name<br/><input name="full_name" required style={inp}/></label>
        <label>Contact<br/><input name="contact" placeholder="email or phone" style={inp}/></label>

        <label>Timeline<br/>
          <select name="timeline" style={inp}>
            <option value="HOT(≤30d)">≤30 days</option>
            <option value="WARM(1–3mo)">1–3 months</option>
            <option value="WATCH(3+mo)">3+ months</option>
          </select>
        </label>

        <label>Price range<br/><input name="price_range" placeholder="$300–400k" style={inp}/></label>

        <label>Loan type<br/>
          <select name="loan_type" style={inp}>
            <option>Conventional</option><option>FHA</option><option>VA</option><option>Cash</option><option>Other</option>
          </select>
        </label>

        {/* New pickers */}
        <BedsPicker onChange={setBeds}/>
        <BathsPicker onChange={setBaths}/>

        <label>Parking<br/>
          <select name="parking" style={inp}>
            <option>Street ok</option><option>1-car</option><option>2-car</option><option>3+</option>
          </select>
        </label>

        <label>Basement<br/>
          <select name="basement" style={inp}>
            <option value="must">Must have</option><option value="nice">Nice to have</option><option value="ok">No basement OK</option>
          </select>
        </label>

        <label>Yard<br/>
          <select name="yard" style={inp}>
            <option value="none">None OK</option><option value="small">Small OK</option><option value="needs">Needs usable yard</option>
          </select>
        </label>

        <label>Condition<br/>
          <select name="condition" style={inp}>
            <option value="turnkey">Turn-key only</option><option value="light">Light updates OK</option><option value="project">Project OK</option>
          </select>
        </label>

        <label>Must-haves<br/><input name="must_haves" placeholder="basement, 2-car" style={inp}/></label>
        <label>Dealbreakers<br/><input name="dealbreakers" placeholder="busy road" style={inp}/></label>
        <label>Areas<br/><input name="areas" placeholder="Crown Point, Cedar Lake" style={inp}/></label>
        <label>Max commute (min)<br/><input type="number" name="max_commute" style={inp}/></label>
        <label>Notes<br/><textarea name="notes" rows={4} style={{...inp, height:'auto'}}/></label>

        <button type="submit" style={{padding:'10px 14px', borderRadius:8, background:'#111', color:'#fff', border:'none'}}>Send</button>
      </form>
      <p style={{marginTop:16,fontSize:12,opacity:.7}}>Powered by Buyer Preference Link</p>
    </main>
  );
}

const inp: React.CSSProperties = {
  width:'100%', padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8
};
