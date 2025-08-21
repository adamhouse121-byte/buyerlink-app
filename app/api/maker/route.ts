// /app/api/maker/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { limitsFor } from "@/lib/plan";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

// allow open join when /api/maker?open=1 is used
const openJoin = new URL(req.url).searchParams.get("open") === "1";

if (!openJoin) {
  // existing password check block stays as-is
  // if you had:
  // const password = (await req.formData()).get("password")
  // compare to process.env.MAKER_PASSWORD etc.
  // and return 401 if wrong.
}

  
const pass = String(body.password ?? "");
  if (pass !== process.env.MAKER_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Bad password" }, { status: 401 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const display_name = String(body.display_name ?? "").trim();
  const plan = (String(body.plan ?? "free").toLowerCase() === "pro" ? "pro" : "free") as "free" | "pro";
  const brand_color = String(body.brand_color ?? "#2E5BFF");
  const logo_url = String(body.logo_url ?? "");

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
  }

  const sb = supabaseServer();

  // find or create agent
  const { data: existing } = await sb
    .from("agents")
    .select("id, plan")
    .eq("email", email)
    .maybeSingle();

  let agentId: string;

  if (existing) {
    await sb
      .from("agents")
      .update({ display_name, plan, brand_color, logo_url })
      .eq("id", existing.id);
    agentId = existing.id;
  } else {
    const { data, error } = await sb
      .from("agents")
      .insert({
        email,
        display_name,
        plan,
        brand_color,
        logo_url,
        submissions_this_period: 0,
        period_start: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: error?.message || "agent create failed" }, { status: 500 });
    }
    agentId = data.id;
  }

  // Enforce form cap for the agent's current plan
  const caps = limitsFor(plan);
  const { count, error: cntErr } = await sb
    .from("forms")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", agentId);

  if (cntErr) {
    return NextResponse.json({ ok: false, error: cntErr.message }, { status: 500 });
  }

  if ((count ?? 0) >= caps.maxForms) {
    return NextResponse.json(
      { ok: false, error: "Free plan allows 1 form. Upgrade to Pro for unlimited forms." },
      { status: 402 }
    );
  }

  // create form
  const { data: form, error: formErr } = await sb
    .from("forms")
    .insert({
      agent_id: agentId,
      name: "Default Buyer Form",
      is_public: true,
      schema_json: {}, // app renders the static form
    })
    .select("id")
    .single();

  if (formErr || !form) {
    return NextResponse.json({ ok: false, error: formErr?.message || "form create failed" }, { status: 500 });
  }

  const base = new URL(req.url).origin;
  return NextResponse.json({
    ok: true,
    agent_id: agentId,
    form_id: form.id,
    form_url: `${base}/form/${form.id}`,
    settings_url: `${base}/a/${agentId}/settings`,
  });
}
