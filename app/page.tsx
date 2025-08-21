// /app/page.tsx
export default function Home() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 20px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.svg" alt="BuyerPref" style={{ height: 40 }} />
          <strong style={{ fontSize: 20 }}>BuyerPref</strong>
        </div>
        <nav style={{ display: "flex", gap: 16 }}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="/signup" style={{ fontWeight: 600 }}>Get started</a>
        </nav>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "center", marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "0 0 12px" }}>
            One link to collect buyer preferences.<br/> Instant summary + match score.
          </h1>
          <p style={{ fontSize: 18, color: "#555", margin: "0 0 18px" }}>
            Stop chasing vague texts. Send a single link, get structured answers, auto-summarized with a score so you can prioritize.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/signup" style={btnPrimary}>Create my form</a>
            <a href="/form/0455136e-693c-4acc-b40c-aa2052669753" style={btnGhost}>See a sample</a>
          </div>
        </div>
        <div>
          <img src="/hero.png" alt="BuyerPref preview" style={{ width: "100%", borderRadius: 12, boxShadow: "0 10px 28px rgba(0,0,0,.12)" }} />
        </div>
      </section>

      <section id="features" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 36 }}>
        {[
          { t: "Share one link", d: "No apps. No logins. Just a link with your logo & color." },
          { t: "Structured answers", d: "Beds, baths, must-haves, dealbreakers, commute, budget—cleanly captured." },
          { t: "Instant summary", d: "Auto-generated summary and match score in your inbox & dashboard." },
          { t: "CSV export", d: "Export leads to your CRM (Pro)." },
          { t: "Brandable", d: "Your name, color, and logo—instantly." },
          { t: "Private", d: "RLS-protected storage on Supabase." },
        ].map((f) => (
          <div key={f.t} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{f.t}</div>
            <div style={{ color: "#555" }}>{f.d}</div>
          </div>
        ))}
      </section>

      <section id="pricing" style={{ marginBottom: 48 }}>
        <h2 style={{ margin: "0 0 16px" }}>Pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Free</div>
            <div style={{ fontSize: 28, margin: "6px 0 12px" }}>$0</div>
            <ul style={ul}>
              <li>1 form</li>
              <li>15 responses / month</li>
              <li>Email notifications</li>
              <li>Basic match score</li>
              <li style={{ opacity: 0.6 }}>CSV export</li>
            </ul>
            <a href="/signup" style={btnPrimaryBlock}>Start free</a>
          </div>
          <div style={card}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Pro</div>
            <div style={{ fontSize: 28, margin: "6px 0 12px" }}>$4.99 / month</div>
            <ul style={ul}>
              <li>Unlimited forms</li>
              <li>100 responses / month</li>
              <li>Email notifications</li>
              <li>Priority match score</li>
              <li>CSV export</li>
            </ul>
            <a href="/signup" style={btnGhostBlock}>Upgrade</a>
          </div>
        </div>
      </section>

      <footer style={{ fontSize: 12, color: "#666", marginTop: 24 }}>
        © {new Date().getFullYear()} BuyerPref — <a href="/maker" style={{ color: "#666" }}>admin</a>
      </footer>
    </main>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  background: "#2E5BFF",
  color: "white",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
};

const btnGhost: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  background: "white",
  color: "#2E5BFF",
  border: "1px solid #2E5BFF",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
};

const card: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 8px 20px rgba(0,0,0,.06)",
};

const ul: React.CSSProperties = {
  margin: "0 0 16px",
  paddingLeft: 18,
  lineHeight: 1.6,
};

const btnPrimaryBlock: React.CSSProperties = {
  ...btnPrimary,
  display: "block",
  textAlign: "center",
};

const btnGhostBlock: React.CSSProperties = {
  ...btnGhost,
  display: "block",
  textAlign: "center",
};
