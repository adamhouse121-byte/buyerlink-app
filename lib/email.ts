// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "Buyer Pref <hello@buyerpref.link>";

export async function sendSummaryEmail(to: string, subject: string, body: string) {
  try {
    const r = await resend.emails.send({
      from: FROM,
      to,
      subject,
      text: body,
    });
    return r;
  } catch (err) {
    console.error("Email send failed:", err);
    // don't crash the request if email fails
    return { error: String(err) };
  }
}
