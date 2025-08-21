import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const openJoin = url.searchParams.get("open") === "1";

  const fd = await req.formData();
  const email = (fd.get("email") || "").toString().trim().toLowerCase();
  const display_name = (fd.get("display_name") || "").toString().trim();
  const brand_color = (fd.get("brand_color") || "#2E5BFF").toString().trim();
  const logo_url = (fd.get("logo_url") || "").toString().trim();
  const planRaw = (fd.get("plan") || "free").toString().trim().toLowerCase();
  const plan = ["free", "pro"].includes(planRaw) ? planRaw : "free";

  if (!openJoin) {
    const pwd = (fd.get("password") || "").toString();
    const ok = !!process.env.MAKER_PASSWORD && pwd === process.env.MAKER_PASSWORD;
    if (!ok) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!email || !display_name) {
    return NextResponse.json({ ok: false, error: "Missing email or name" }, { status: 400 });
  }

  const sb = supabaseServer();

  // Upsert agent by email so duplicates don't error
  const { data: agentRow, error: agentErr } = await sb
    .from("agents")
    .upsert({ email, display_name, brand_color, logo_url, plan }, { onConflict: "email" })
    .select("id")
    .single();

  if (agentErr || !agentRow) {
    return NextResponse.json({ ok: false, error: agentErr?.message || "agent upsert failed" }, { status: 400 });
  }

  const agent_id = agentRow.id;

  // Ensure the agent has at least one form
  const { data: existing } = await sb.from("forms").select("id").eq("agent_id", agent_id).limit(1);
  let form_id = existing?.[0]?.id as string | undefined;

  if (!form_id) {
    const { data: formIns, error: formErr } = await sb
      .from("forms")
      .insert({ agent_id, name: "Default Buyer Form", is_public: true, schema_json: {} })
      .select("id")
      .single();
    if (formErr || !formIns) {
      return NextResponse.json({ ok: false, error: formErr?.message || "form insert failed" }, { status: 400 });
    }
    form_id = formIns.id;
  }

  return NextResponse.json({ ok: true, agent_id, form_id });
}
