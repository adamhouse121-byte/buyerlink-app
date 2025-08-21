// /app/api/signup/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendSummaryEmail } from "@/lib/email";

function originOf(req: Request) {
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_BASE_URL || process.env.VERCEL_URL;
  if (env) return env.startsWith("http") ? env : `https://${env}`;
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    const { email, display_name, brand_color, logo_url } = await req.json();

    if (!email || !display_name) {
      return NextResponse.json({ error: "Email and display name are required." }, { status: 400 });
    }

    const sb = supabaseServer();

    // 1) Find or create agent (default plan=free)
    const { data: existing } = await sb
      .from("agents")
      .select("id, plan")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    let agentId: string;
    if (existing) {
      agentId = existing.id;
      await sb.from("agents").update({
        display_name, brand_color: brand_color || null, logo_url: logo_url || null,
      }).eq("id", agentId);
    } else {
      const { data: a, error: aErr } = await sb
        .from("agents")
        .insert({
          email: email.toLowerCase(),
          display_name,
          plan: "free",
          brand_color: brand_color || null,
          logo_url: logo_url || null,
          submissions_this_period: 0,
          period_start: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
        })
        .select("id")
        .single();
      if (aErr || !a) return NextResponse.json({ error: aErr?.message || "agent create failed" }, { status: 500 });
      agentId = a.id;
    }

    // 2) Enforce Free plan form cap (1 form)
    const { count } = await sb
      .from("forms")
      .select("id", { head: true, count: "exact" })
      .eq("agent_id", agentId);

    if ((count ?? 0) >= 1) {
      // already has one—just return links to existing assets
      const base = originOf(req);
      return NextResponse.json({
        ok: true,
        formUrl: `${base}/a/${agentId}/inbox`,
        inboxUrl: `${base}/a/${agentId}/inbox`,
        settingsUrl: `${base}/a/${agentId}/settings`,
        note: "You already have a form on Free plan.",
      });
    }

    // 3) Create default form
    const { data: form, error: fErr } = await sb
      .from("forms")
      .insert({ agent_id: agentId, name: "Default Buyer Form", is_public: true, schema_json: {} })
      .select("id")
      .single();

    if (fErr || !form) return NextResponse.json({ error: fErr?.message || "form create failed" }, { status: 500 });

    const base = originOf(req);
    const formUrl = `${base}/form/${form.id}`;
    const inboxUrl = `${base}/a/${agentId}/inbox`;
    const settingsUrl = `${base}/a/${agentId}/settings`;

    // 4) Send a quick confirmation (best-effort)
    try {
      await sendSummaryEmail(
        email,
        "Your Buyer Preference link",
        `Your buyer form is ready:\n${formUrl}\n\nInbox:\n${inboxUrl}\n\nSettings:\n${settingsUrl}`
      );
    } catch {}

    return NextResponse.json({ ok: true, formUrl, inboxUrl, settingsUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
