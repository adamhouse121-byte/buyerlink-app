// /app/api/a/[agentId]/export/route.ts
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: { agentId: string } }
) {
  const sb = supabaseServer();

  // Pro check
  const { data: agent, error: agErr } = await sb
    .from("agents")
    .select("plan, id, display_name")
    .eq("id", params.agentId)
    .single();

  if (agErr || !agent) {
    return new Response("Agent not found", { status: 404 });
  }
  if (agent.plan !== "pro") {
    return new Response("CSV export is a Pro feature", { status: 402 });
  }

  // Find forms for the agent
  const { data: forms, error: fErr } = await sb
    .from("forms")
    .select("id")
    .eq("agent_id", agent.id);

  if (fErr) return new Response(fErr.message, { status: 500 });

  const formIds = (forms ?? []).map((f: any) => f.id);
  if (formIds.length === 0) return new Response("No data", { status: 200 });

  // Pull responses
  const { data: rows, error: rErr } = await sb
    .from("responses")
    .select("id, created_at, form_id, answers_json, summary_text, match_score")
    .in("form_id", formIds)
    .order("created_at", { ascending: false });

  if (rErr) return new Response(rErr.message, { status: 500 });

  // Build CSV
  const headers = ["id", "created_at", "form_id", "match_score", "summary_text", "answers_json"];
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lines = [
    headers.join(","),
    ...(rows ?? []).map((r: any) =>
      [
        r.id,
        r.created_at,
        r.form_id,
        r.match_score ?? "",
        r.summary_text ?? "",
        JSON.stringify(r.answers_json ?? {}),
      ].map(escape).join(",")
    ),
  ].join("\n");

  return new Response(lines, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="buyerlink-${agent.id}.csv"`,
    },
  });
}
