export default function Home() {
  return (
    <main style={{maxWidth:860, margin:"40px auto", padding:"0 16px"}}>
      <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24}}>
        <h1 style={{margin:0}}>Buyer Preference Link</h1>
        <a href="/maker" style={{fontSize:14, opacity:.7}}>Maker (admin)</a>
      </header>

      <section style={{display:"grid", gap:16}}>
        <h2 style={{marginTop:0}}>Turn buyer preferences into a one-pager you can act on.</h2>
        <p style={{opacity:.8}}>
          Text a link. Get must-haves, dealbreakers, areas, timeline, and a tidy summary in your inbox—plus a score so you can prioritize.
        </p>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <a href="/maker"
             style={{background:"#2E5BFF", color:"#fff", padding:"10px 16px", borderRadius:8, textDecoration:"none"}}>
            Get your Buyer Link
          </a>
          <a href="mailto:you@example.com?subject=BuyerLink demo"
             style={{padding:"10px 16px", border:"1px solid #ddd", borderRadius:8, textDecoration:"none"}}>
            Ask for a demo
          </a>
        </div>
      </section>

      <section style={{display:"grid", gap:16, marginTop:32}}>
        <div style={{border:"1px solid #eee", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>✅ Two-minute setup</h3>
          <p style={{marginTop:8, opacity:.8}}>Create your agent, paste a brand color & logo, share the link.</p>
        </div>
        <div style={{border:"1px solid #eee", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>🧠 Useful summaries</h3>
          <p style={{marginTop:8, opacity:.8}}>Clear text summary + match score + tags for quick sorting.</p>
        </div>
        <div style={{border:"1px solid #eee", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>📥 Inbox & CSV</h3>
          <p style={{marginTop:8, opacity:.8}}>See your last submissions and export to share or archive.</p>
        </div>
      </section>

      <footer style={{marginTop:32, opacity:.6, fontSize:12}}>
        <a href="/terms" style={{marginRight:12}}>Terms</a>
        <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
