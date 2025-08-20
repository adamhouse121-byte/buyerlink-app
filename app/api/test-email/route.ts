// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendSummaryEmail } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  if (!to) return NextResponse.json({ ok: false, error: "Missing ?to=" }, { status: 400 });

  const r = await sendSummaryEmail(to, "BuyerPref test", "If you got this, Resend is set up.");
  return NextResponse.json({ ok: true, result: r });
}
