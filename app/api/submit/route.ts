// /app/api/submit/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { summarizeAndScore } from "@/lib/summarize";
import { sendSummaryEmail } from "@/lib/email";
import { limitsFor } from "@/lib/plan";

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const form_id = String(fd.get("form_id") ?? "");

    // Collect answers
    const answers: Record<string, any> = {
      full_name: fd.get("full_name")?.toString() || "",
      email: fd.get("email")?.toString() || "",
      phone: fd.get("phone")?.toString() || "",
      contact: fd.get("contact")?.toString() || "", // backward compat
      timeline: fd.get("timeline")?.toString() || "",
      price_range: fd.get("price_range")?.toString() || "",
      loan_type: fd.get("loan_type")?.toString() || "",
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

    const toList = (v: any) =>
      (v?.toString() || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

    // checkbox arrays + “Other”
    const musts = fd.getAll("must_haves").map((v) => String(v));
    const nos = fd.getAll("dealbreakers").map((v) => String(v));
    const types = fd.getAll("home_types").map((v) => String(v));

    answers.must_haves = [...musts, ...toList(fd.get("must_haves_other"))];
    answers.dealbreakers = [...nos, ...toList(fd.get("dealbreakers_other"))];
    answers.home_types = [...types, ...toList(fd.get("home_types_other"))];

    const sb = supabaseServer();

    // Get agent from form
    const { data: formRow, error: formErr } = await sb
      .from("forms")
      .select("agent_id")
      .eq("id", form_id)
      .single();

    if (formErr || !formRow) {
      return NextResponse.json(
        { ok: false, error: formErr?.message || "Form not found" },
        { status: 404 }
      );
    }

    // --- PLAN + QUOTA CHECKS ---------------------------------------
    const { data: agent, error: agErr } = await sb
      .from("agents")
      .select("id, email, display_name, plan, submissions_this_period, period_start")
      .eq("id", formRow.agent_id)
      .single();

    if (agErr || !agent) {
      return NextResponse.json(
        { ok: false, error: agErr?.message || "Agent not found" },
        { status: 404 }
      );
    }

    // Reset monthly window if changed
    const now = new Date();
    const start = agent.period_start ? new Date(agent.period_start) : null;
    const isNewMonth =
      !start ||
      start.getUTCFullYear() !== now.getUTCFullYear() ||
      start.getUTCMonth() !== now.getUTCMonth();

    if (isNewMonth) {
      await sb
        .from("agents")
        .update({
          submissions_this_period: 0,
          period_start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(),
        })
        .eq("id", agent.id);

      agent.submissions_this_period = 0;
    }

    const caps = limitsFor(agent.plan);
    const used = agent.submissions_this_period ?? 0;

    if (used >= caps.monthlyResponses) {
      return NextResponse.json(
        {
          ok: false,
          error:
            agent.plan === "pro"
              ? "Monthly Pro quota reached. Please contact support."
              : "Monthly free quota reached. Upgrade to Pro to keep collecting leads.",
        },
        { status: 402 }
      );
    }
    // ---------------------------------------------------------------

    // 1) score & summarize
    const { summary, tags, score } = summarizeAndScore(answers);

    // 2) store via RPC
    const { data: rid, error: rpcErr } = await sb.rpc("submit_response", {
      p_form_id: form_id,
      p_answers: answers,
      p_buyer_name: answers.full_name || null,
      p_buyer_email:
        (answers.email as string) ||
        (answers.contact as string) ||
        null,
    });

    if (rpcErr || !rid) {
      return NextResponse.json(
        { ok: false, error: rpcErr?.message || "submit failed" },
        { status: 400 }
      );
    }

    const id = Array.isArray(rid) ? rid[0] : rid;

    // 3) update summary/score
    const { error: upErr } = await sb
      .from("responses")
      .update({ summary_text: summary, tags_json: tags, match_score: score })
      .eq("id", id);

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    // 4) increment monthly counter
    await sb
      .from("agents")
      .update({ submissions_this_period: used + 1 })
      .eq("id", agent.id);

    // 5) email the agent (don’t block on failures)
    if (agent.email) {
      const subject = `New buyer: ${answers.full_name || "Unknown"} (${answers.price_range || "price n/a"})`;
      const body = [
        `Agent: ${agent.display_name || ""}`,
        "",
        summary,
        "",
        `Match score: ${score}`,
        `Response ID: ${id}`,
      ].join("\n");
      try {
        await sendSummaryEmail(agent.email, subject, body);
      } catch {}
    }

    return NextResponse.redirect(new URL("/thank-you", req.url), { status: 303 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "unexpected error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Use the public form at /form/:formId (POST only)." },
    { status: 405 }
  );
}
