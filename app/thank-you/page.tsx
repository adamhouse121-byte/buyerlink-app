import { supabaseServer } from "@/lib/supabaseServer";

export default async function ThankYou() {
  // If you want per-agent branding here too, you can read from agents by cookie or URL.
  // For now just use a default color to keep it simple.
  const color = "#2E5BFF";
  return (
    <main>
      <h1 style={{ color }}>Thanks!</h1>
      <p>We received your preferences.</p>
      <p style={{ fontSize: 12, opacity: 0.7 }}>Powered by Buyer Preference Link</p>
    </main>
  );
}
