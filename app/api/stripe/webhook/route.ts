import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `invalid signature: ${err.message}` }, { status: 400 });
  }

  const sb = supabaseServer();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as any;
        const agent_id = s.client_reference_id || s.metadata?.agent_id || null;
        if (agent_id) {
          await sb.from("agents").update({
            plan: "pro",
            stripe_customer_id: s.customer ?? null,
            stripe_subscription_id: s.subscription ?? null,
            stripe_subscription_status: "active",
          }).eq("id", agent_id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const cust = sub.customer as string;
        const status = sub.status as string;
        const { data: a } = await sb.from("agents").select("id").eq("stripe_customer_id", cust).single();
        if (a?.id) {
          await sb.from("agents").update({
            stripe_subscription_id: sub.id,
            stripe_subscription_status: status,
            plan: (status === "active" || status === "trialing") ? "pro" : "free",
          }).eq("id", a.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const cust = sub.customer as string;
        const { data: a } = await sb.from("agents").select("id").eq("stripe_customer_id", cust).single();
        if (a?.id) {
          await sb.from("agents").update({
            stripe_subscription_id: null,
            stripe_subscription_status: "canceled",
            plan: "free",
          }).eq("id", a.id);
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    // log-only; we still return 200 so Stripe won't hammer retries during dev
    console.error(e);
  }

  return new NextResponse(null, { status: 200 });
}
