// app/api/join/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function baseUrl(req: Request) {
  // Prefer your public site url if set
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  return env ? (env.startsWith("http") ? env : `https://${env}`) : new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    const { code, email, display_name, brand_color, logo_url, plan } = await req.json();

    if (!code || code !== process.env.MAKER_PASSWORD) {
      return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
    }
    if (!email || !display_name) {
      return NextResponse.json({ error: "Email and display name are required." }, { status: 400 });
    }

    const sb = supabaseServer();

    // 1) create agent
    const { data: agent, error: aErr } = await sb
      .from("agents")
      .insert({
        email,
        display_name,
        plan: plan || "free",
        brand_color: brand_color || null,
        logo_url: logo_url || null,
      })
      .select("id")
      .single();

    if (aErr || !agent) {
      return NextResponse.json({ error: aErr?.message || "agent insert failed" }, { status: 500 });
    }

    // 2) create default form
    const { data: form, error: fErr } = await sb
      .from("forms")
      .insert({
        agent_id: agent.id,
        name: "Default Buyer Form",
        is_public: true,
        schema_json: {},
      })
      .select("id")
      .single();

    if (fErr || !form) {
      return NextResponse.json({ error: fErr?.message || "form insert failed" }, { status: 500 });
    }

    const origin = baseUrl(req);
    const formUrl = `${origin}/form/${form.id}`;
    const inboxUrl = `${origin}/a/${agent.id}/inbox`;
    const settingsUrl = `${origin}/a/${agent.id}/settings`;

    return NextResponse.json({ ok: true, formUrl, inboxUrl, settingsUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
