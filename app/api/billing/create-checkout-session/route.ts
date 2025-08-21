import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { agent_id, email } = await req.json();
    if (!agent_id || !email) return NextResponse.json({ error: "missing agent_id/email" }, { status: 400 });

    const sb = supabaseServer();
    const { data: agent } = await sb
      .from("agents")
      .select("stripe_customer_id")
      .eq("id", agent_id)
      .single();

    let customerId = agent?.stripe_customer_id;
    if (!customerId) {
      const c = await stripe.customers.create({ email, metadata: { agent_id } });
      customerId = c.id;
      await sb.from("agents").update({ stripe_customer_id: customerId }).eq("id", agent_id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_PRO!, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: agent_id,
      metadata: { agent_id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "checkout error" }, { status: 500 });
  }
}
