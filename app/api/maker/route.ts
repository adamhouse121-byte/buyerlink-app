import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { password, email, display_name, plan = "free", brand_color, logo_url } = body || {};

  if (!password || password !== process.env.MAKER_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!email || !display_name) {
    return NextResponse.json({ ok: false, error: "Missing email or display_name" }, { status: 400 });
  }

  const sb = supabaseServer(); // uses service role key

  // 1) Create auth user
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email,
    email_confirm: false,
  });
  if (createErr || !created?.user?.id) {
    return NextResponse.json({ ok: false, error: createErr?.message || "auth create failed" }, { status: 400 });
  }
  const userId = created.user.id;

  // 2) Insert agent row
  const { error: agentErr } = await sb.from("agents").insert({
    id: userId,
    display_name,
    email,
    plan,
    brand_color: brand_color || null,
    logo_url: logo_url || null,
  });
  if (agentErr) return NextResponse.json({ ok: false, error: agentErr.message }, { status: 400 });

  // 3) Create default form
  const { data: formRow, error: formErr } = await sb
    .from("forms")
    .insert({ agent_id: userId, name: "Default Buyer Form" })
    .select("id")
    .single();
  if (formErr || !formRow) {
    return NextResponse.json({ ok: false, error: formErr?.message || "form create failed" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    user_id: userId,
    form_id: formRow.id,
    form_url: `/form/${formRow.id}`,
    settings_url: `/a/${userId}/settings`,
  });
}
