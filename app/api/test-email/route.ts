import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const from = process.env.EMAIL_FROM!;
    const to = process.env.TEST_EMAIL_TO || "adamhouse121@gmail.com";

    await resend.emails.send({
      from,
      to,
      subject: "BuyerPref test email",
      text: "If you got this, domain-signed email works 🎉",
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
