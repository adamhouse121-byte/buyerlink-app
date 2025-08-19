import { NextResponse } from "next/server";
import { sendSummaryEmail } from "@/lib/email";

export async function GET() {
  try {
    const to = process.env.EMAIL_TO_OVERRIDE || "adamhouserealty@gmail.com";
    await sendSummaryEmail(
      to,
      "BuyerLink test email",
      `Hello! EMAIL_FROM=${process.env.EMAIL_FROM || "(unset)"}`
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
