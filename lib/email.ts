import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function sendSummaryEmail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing; skipping email send.");
    return { skipped: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: "BuyerLink <onboarding@resend.dev>", // OK for testing
      to,
      subject,
      text,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e: any) {
    console.error("Email send failed:", e);
    return { ok: false, error: String(e) };
  }
}
