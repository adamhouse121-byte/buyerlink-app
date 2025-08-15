export type SummaryResult = { summary: string; tags: string[]; score: number };

export function summarizeAndScore(a: Record<string, any>): SummaryResult {
  const asArray = (v: any): string[] =>
    Array.isArray(v) ? v : String(v || "").split(",").map(s => s.trim()).filter(Boolean);

  const price = (a.price_range || "") as string;
  const loan = (a.loan_type || "") as string;
  const beds = Number(a.beds || 0);
  const baths = Number(a.baths || 0);
  const parking = (a.parking || "") as string;
  const basement = (a.basement || "") as string;
  const yard = (a.yard || "") as string;
  const condition = (a.condition || "") as string;
  const musts = asArray(a.must_haves);
  const nogos = asArray(a.dealbreakers);
  const areas = asArray(a.areas);

  const tags = [
    `Loan:${loan || "Unknown"}`,
    ...(a.timeline ? [`Timeline:${a.timeline}`] : []),
    ...musts.map((m) => `MUST:${m}`),
    ...nogos.map((n) => `NO:${n}`),
  ];

  let score = 20; // base; assumes agent filters price themselves
  if (beds >= 3) score += 10; else if (beds >= 2) score += 5;
  if (baths >= 2) score += 10; else score += 5;
  if (parking.includes("2")) score += 10; else if (parking) score += 5;
  if (basement === "must") score += 10; else if (basement === "nice") score += 5;
  if (yard === "needs") score += 5;
  if (condition === "turnkey") score += 5; else if (condition === "light") score += 3;
  score = Math.min(100, score);

  const summary = [
    `Buyer: ${a.full_name || "—"} | Price: ${price || "—"} | Loan: ${loan || "—"} | Timeline: ${a.timeline || "—"}`,
    `Home: ${beds} bd / ${baths}+ ba / ${parking || "—"}; Basement: ${basement}; Yard: ${yard}; Condition: ${condition}`,
    `Must-haves: ${musts.slice(0, 3).join(", ") || "—"} | Dealbreakers: ${nogos.slice(0, 3).join(", ") || "—"}`,
    `Areas: ${areas.join(", ") || "—"}; Commute ≤ ${(a.max_commute || "—")} min`,
  ].join("\n");

  return { summary, tags, score };
}
