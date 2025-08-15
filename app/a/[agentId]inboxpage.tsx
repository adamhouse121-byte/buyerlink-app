import { supabaseServer } from "@/lib/supabaseServer";

export default async function Inbox({ params }: { params: { agentId: string } }) {
  const sb = supabaseServer();
  const { agentId } = params;

  // All forms for this agent
  const { data: forms, error: formsErr } = await sb
    .from("forms")
    .select("id, name")
    .eq("agent_id", agentId);

  if (formsErr) return <main><p>Error: {formsErr.message}</p></main>;
  const formIds = (forms || []).map(f => f.id);
  if (!formIds.length) return <main><h1>Inbox</h1><p>No forms for this agent yet.</p></main>;

  // Latest responses across those forms
  const { data: rows, error: respErr } = await sb
    .from("responses")
    .select("id, created_at, match_score, buyer_name, summary_text")
    .in("form_id", formIds)
    .order("created_at", { ascending: false })
    .limit(50);

  if (respErr) return <main><p>Error: {respErr.message}</p></main>;

  return (
    <main>
      <h1>Inbox</h1>
      <p style={{marginTop:0,opacity:.7}}>
        Showing last {rows?.length || 0} submissions.{" "}
        <a href={`/api/a/${agentId}/export`}>Download CSV</a>
      </p>
      <table cellPadding={6} style={{borderCollapse:"collapse", width:"100%"}}>
        <thead>
          <tr style={{textAlign:"left", borderBottom:"1px solid #ddd"}}>
            <th>Date</th><th>Buyer</th><th>Score</th><th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {(rows||[]).map(r=>(
            <tr key={r.id} style={{borderBottom:"1px solid #eee", verticalAlign:"top"}}>
              <td>{new Date(r.created_at!).toLocaleString()}</td>
              <td>{r.buyer_name || "—"}</td>
              <td>{r.match_score ?? "—"}</td>
              <td style={{whiteSpace:"pre-wrap"}}>{(r.summary_text || "").slice(0,300)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
