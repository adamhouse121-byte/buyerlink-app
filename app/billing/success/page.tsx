// app/billing/success/page.tsx
export const metadata = { title: "Payment successful · BuyerPref", robots: { index: false } };

export default function SuccessPage() {
  return (
    <main style={{ maxWidth: 680, margin: "64px auto", padding: "0 16px", lineHeight: 1.6 }}>
      <h1>Thanks! 🎉</h1>
      <p>Your payment was successful and your account is being upgraded to <b>Pro</b>.</p>
      <p>It can take up to ~30 seconds to show on your dashboard after the webhook runs.</p>
      <p>
        You can close this tab, or{" "}
        <a href="/" style={{ textDecoration: "underline" }}>
          go back to BuyerPref
        </a>.
      </p>
    </main>
  );
}
