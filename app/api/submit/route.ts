import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { summarizeAndScore } from "@/lib/summarize";
import { sendSummaryEmail } from "@/lib/email";

export async function POST(req: Request) {
  const fd = await req.formData();
  const form_id = String(fd.get("form_id") || "");

  const answers: Record<string, any> = {
    full_name: fd.get("full_name")?.toString() || "",
    // prefer explicit email; keep contact for backward compatibility
    contact: fd.get("contact")?.toString() || fd.get("email")?.toString() || "",
    email: fd.get("email")?.toString() || "",
    phone: fd.get("phone")?.toString() || fd.get("phone_display")?.toString() || "",
    timeline: fd.get("timeline")?.toString() || "",
    price_range: fd.get("price_range")?.toString() || "",
    loan_type: fd.get("loan_type")?.toString() || "",
    home_types: fd.get("home_types")?.toString() || "",
    beds: fd.get("beds")?.toString() || "",
    baths: fd.get("baths")?.toString() || "",
    parking: fd.get("parking")?.toString() || "",
    basement: fd.get("basement")?.toString() || "",
    yard: fd.get("yard")?.toString() || "",
    condition: fd.get("condition")?.toString() || "",
    areas: fd.get("areas")?.toString() || "",
    max_commute: fd.get("max_commute")?.toString() || "",
    notes: fd.get("notes")?.toString() || "",
  };

  // checkbox arrays + "Other"
  const toList = (v: any) =>
    (v?.toString() || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  const musts = fd.getAll("must_haves").map((v) => String(v));
  const nos = fd.getAll("dealbreakers").map((v) => String(v));
  answers.must_haves = [...musts, ...toList(fd.get("must_haves_other"))];
  answers.dealbreakers = [...nos, ...toList(fd.get("dealbreakers_other"))];

  // 1) score & summarize
  const { summary, tags, score } = summarizeAndScore(answers);

  // 2) store via RPC
  const sb = supabaseServer();
  const { data: rid, error: rpcErr } = await sb.rpc("submit_response", {
    p_form_id: form_id,
    p_answers: answers,
    p_buyer_name: answers.full_name || null,
    p_buyer_email: answers.email || answers.contact || null,
  });
  if (rpcErr || !rid) {
    return NextResponse.json({ ok: false, error: rpcErr?.message || "submit failed" }, { status: 400 });
  }
  const id = Array.isArray(rid) ? rid[0] : rid;

  // 3) update summary/score
  const { error: upErr } = await sb
    .from("responses")
    .update({ summary_text: summary, tags_json: tags, match_score: score })
    .eq("id", id);
  if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

  // 4) email the agent (you)
  const { data: formRow } = await sb.from("forms").select("agent_id").eq("id", form_id).single();
  if (formRow?.agent_id) {
    const { data: agent } = await sb
      .from("agents")
      .select("email, display_name")
      .eq("id", formRow.agent_id)
      .single();
    if (agent?.email) {
      const subject = `New buyer: ${answers.full_name || "Unknown"} (${answers.price_range || "price n/a"})`;
      const body = [
        `Agent: ${agent.display_name || ""}`,
        "",
        summary,
        "",
        `Match score: ${score}`,
        `Response ID: ${id}`,
      ].join("\n");
      await sendSummaryEmail(agent.email, subject, body);
    }
  }

  return NextResponse.redirect(new URL("/thank-you", req.url), { status: 303 });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Use the public form at /form/:formId (POST only)." },
    { status: 405 }
  );
}
