import { supabaseServer } from "@/lib/supabaseServer";

export default async function F({ params }: { params: { formId: string } }) {
  const { formId } = params;

  // --- fetch brand from DB ---
  const sb = supabaseServer();
  const { data: form } = await sb.from("forms").select("agent_id").eq("id", formId).single();
  let brand = { color: "#2E5BFF", logo: "", agentName: "" };
  if (form?.agent_id) {
    const { data: agent } = await sb
      .from("agents")
      .select("brand_color, logo_url, display_name")
      .eq("id", form.agent_id)
      .single();
    if (agent) {
      brand.color = agent.brand_color || brand.color;
      brand.logo = agent.logo_url || "";
      brand.agentName = agent.display_name || "";
    }
  }

  const mustHaveOptions = [
    "Basement",
    "2-car garage",
    "Updated kitchen",
    "Home office",
    "Fenced yard",
    "Open layout",
    "Natural light",
    "Quiet street",
    "Near park/trail",
    "Low HOA",
  ];

  const dealbreakerOptions = [
    "Busy road",
    "Near tracks",
    "Power lines",
    "Tiny bedrooms",
    "No parking",
    "HOA > $350/mo",
    "No in-unit laundry",
    "Floodplain",
    "Pet restrictions",
  ];

  return (
    <main>
      {/* Brand header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        {brand.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logo} alt="Logo" style={{ height: 40 }} />
        ) : null}
        <h1 style={{ color: brand.color, margin: 0 }}>Buyer Preferences</h1>
      </div>
      {brand.agentName ? (
        <p style={{ marginTop: 0, opacity: 0.7 }}>For {brand.agentName}</p>
      ) : null}

      <form method="post" action="/api/submit">
        <input type="hidden" name="form_id" value={formId} />

        <label>
          Full name<br />
          <input name="full_name" required />
        </label>
        <br />

        <label>
          Contact (email or phone)<br />
          <input name="contact" />
        </label>
        <br />

        <label>
          Timeline<br />
          <select name="timeline">
            <option value="HOT(≤30d)">≤30 days</option>
            <option value="WARM(1–3mo)">1–3 months</option>
            <option value="WATCH(3+mo)">3+ months</option>
          </select>
        </label>
        <br />

        <label>
          Price range (e.g., 325k–400k)<br />
          <input name="price_range" />
        </label>
        <br />

        <label>
          Loan type<br />
          <select name="loan_type">
            <option>Conventional</option>
            <option>FHA</option>
            <option>VA</option>
            <option>Cash</option>
            <option>Other</option>
          </select>
        </label>
        <br />

        <label>
          Beds<br />
          <select name="beds">
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </select>
        </label>
        <br />

        <label>
          Baths<br />
          <select name="baths">
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </label>
        <br />

        <label>
          Parking<br />
          <select name="parking">
            <option>Street ok</option>
            <option>1-car</option>
            <option>2-car</option>
            <option>3+</option>
          </select>
        </label>
        <br />

        <label>
          Basement<br />
          <select name="basement">
            <option value="must">Must have</option>
            <option value="nice">Nice to have</option>
            <option value="ok">No basement OK</option>
          </select>
        </label>
        <br />

        <label>
          Yard/outdoor<br />
          <select name="yard">
            <option value="none">None OK</option>
            <option value="small">Small OK</option>
            <option value="needs">Needs usable yard</option>
          </select>
        </label>
        <br />

        <label>
          Condition<br />
          <select name="condition">
            <option value="turnkey">Turn-key only</option>
            <option value="light">Light updates OK</option>
            <option value="project">Project OK</option>
          </select>
        </label>
        <br />

        {/* Must-haves */}
        <fieldset style={{ marginTop: 12 }}>
          <legend style={{ color: brand.color }}>
            <strong>Top must-haves (pick a few)</strong>
          </legend>
          {mustHaveOptions.map((opt) => (
            <label key={opt} style={{ display: "block" }}>
              <input type="checkbox" name="must_haves" value={opt} /> {opt}
            </label>
          ))}
          <label style={{ display: "block", marginTop: 6 }}>
            Other: <input name="must_haves_other" placeholder="e.g., first-floor bedroom" />
          </label>
        </fieldset>

        {/* Dealbreakers */}
        <fieldset style={{ marginTop: 12 }}>
          <legend style={{ color: brand.color }}>
            <strong>Hard dealbreakers</strong>
          </legend>
          {dealbreakerOptions.map((opt) => (
            <label key={opt} style={{ display: "block" }}>
              <input type="checkbox" name="dealbreakers" value={opt} /> {opt}
            </label>
          ))}
          <label style={{ display: "block", marginTop: 6 }}>
            Other: <input name="dealbreakers_other" placeholder="e.g., no split-level" />
          </label>
        </fieldset>

        <br />
        <label>
          Areas (comma-separated)<br />
          <input name="areas" placeholder="Crown Point, Cedar Lake" />
        </label>
        <br />

        <label>
          Max commute (minutes)<br />
          <input type="number" name="max_commute" min={0} />
        </label>
        <br />

        <label>
          Anything else?<br />
          <textarea name="notes" />
        </label>
        <br />

        <button
          type="submit"
          style={{
            background: brand.color,
            color: "white",
            border: 0,
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Send
        </button>

        <p style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
          Your info goes to your agent so they can help you find homes that fit. No spam.
        </p>
      </form>

      <p style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        Powered by Buyer Preference Link
      </p>
    </main>
  );
}
