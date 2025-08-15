import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(_: Request, { params }: { params: { agentId: string } }) {
  const sb = supabaseServer();
  const { agentId } = params;

  const { data: forms } = await sb.from("forms").select("id").eq("agent_id", agentId);
  const formIds = (forms || []).map(f => f.id);
  if (!formIds.length) return new Response("no data", { status: 404 });

  const { data: rows } = await sb
    .from("responses")
    .select("id,created_at,buyer_name,buyer_email,match_score,summary_text,answers_json")
    .in("form_id", formIds)
    .order("created_at", { ascending: false })
    .limit(1000);

  const esc = (s: any) => {
    const v = s == null ? "" : String(s);
    return `"${v.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    };
  const header = ["id","created_at","buyer_name","buyer_email","match_score","summary_text","answers_json"].join(",");
  const lines = (rows || []).map(r =>
    [esc(r.id), esc(r.created_at), esc(r.buyer_name), esc(r.buyer_email),
     esc(r.match_score), esc(r.summary_text), esc(JSON.stringify(r.answers_json || {}))].join(","));
  const csv = [header, ...lines].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="responses_${agentId}.csv"`,
    },
  });
}
