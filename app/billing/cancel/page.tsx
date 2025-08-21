// app/billing/cancel/page.tsx
export const metadata = { title: "Checkout canceled · BuyerPref", robots: { index: false } };

export default function CancelPage() {
  return (
    <main style={{ maxWidth: 680, margin: "64px auto", padding: "0 16px", lineHeight: 1.6 }}>
      <h1>Checkout canceled</h1>
      <p>No worries—your card was not charged.</p>
      <p>
        You can{" "}
        <a href="/billing/test" style={{ textDecoration: "underline" }}>
          try checkout again
        </a>{" "}
        or{" "}
        <a href="/" style={{ textDecoration: "underline" }}>
          go back to BuyerPref
        </a>.
      </p>
    </main>
  );
}
