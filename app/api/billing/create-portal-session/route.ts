import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { agent_id } = await req.json();
    if (!agent_id) return NextResponse.json({ error: "missing agent_id" }, { status: 400 });

    const sb = supabaseServer();
    const { data: agent, error } = await sb
      .from("agents")
      .select("stripe_customer_id")
      .eq("id", agent_id)
      .single();

    if (error || !agent?.stripe_customer_id) {
      return NextResponse.json({ error: "no stripe customer on file" }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: agent.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/a/${agent_id}/settings`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "portal error" }, { status: 500 });
  }
}
