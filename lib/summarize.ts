// /lib/summarize.ts
type Answers = Record<string, any>;
type ScoreParts = { label: string; delta: number }[];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function hasAny(list: string[] | undefined) {
  return Array.isArray(list) && list.length > 0;
}

function listify(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function summarizeAndScore(answers: Answers): {
  summary: string;
  tags: string[];
  score: number;
} {
  const parts: ScoreParts = [];
  let score = 50; // neutral baseline

  const musts = listify(answers.must_haves).map((s) => s.toLowerCase());
  const nos = listify(answers.dealbreakers).map((s) => s.toLowerCase());
  const homeTypes = listify(answers.home_types);

  // --- Timeline weight ---
  const tl = String(answers.timeline || "").toLowerCase();
  if (tl.includes("≤30") || tl.includes("<30") || tl.includes("hot") || tl.includes("less than 3 months") || tl.includes("<3")) {
    score += 6; parts.push({ label: "Hot timeline", delta: +6 });
  } else if (tl.includes("3-6") || tl.includes("3–6") || tl.includes("3 to 6")) {
    score += 3; parts.push({ label: "3–6 mo", delta: +3 });
  } else if (tl.includes("6-18") || tl.includes("6–18") || tl.includes("6 to 18")) {
    score += 1; parts.push({ label: "6–18 mo", delta: +1 });
  } else if (tl.includes("2+") || tl.includes("2 plus") || tl.includes("2+ years")) {
    score -= 3; parts.push({ label: "2+ years", delta: -3 });
  }

  // --- Must-haves & dealbreakers ---
  // (In this simple version we don’t have a listing to compare against, so we
  // reward clarity of must-haves a little and penalize many dealbreakers a little.)
  if (hasAny(musts)) {
    const d = Math.min(8, musts.length * 1.5);
    score += d; parts.push({ label: "Clear must-haves", delta: +d });
  }
  if (hasAny(nos)) {
    const d = Math.min(8, nos.length * 1.0);
    score -= d; parts.push({ label: "Many dealbreakers", delta: -d });
  }

  // --- Beds/Baths specificity bonus ---
  if (String(answers.beds || "").length > 0) { score += 2; parts.push({ label: "Beds set", delta: +2 }); }
  if (String(answers.baths || "").length > 0) { score += 2; parts.push({ label: "Baths set", delta: +2 }); }

  // --- Commute threshold ---
  const commute = Number(answers.max_commute || 0);
  if (commute > 0 && commute <= 30) { score += 4; parts.push({ label: "Commute ≤30", delta: +4 }); }
  else if (commute > 60) { score -= 4; parts.push({ label: "Commute >60", delta: -4 }); }

  // --- Condition ---
  const cond = String(answers.condition || "").toLowerCase();
  if (cond.includes("turn")) { score += 3; parts.push({ label: "Turn-key", delta: +3 }); }
  if (cond.includes("project")) { score -= 2; parts.push({ label: "Project OK", delta: -2 }); }

  // --- Home types clarity ---
  if (hasAny(homeTypes)) { score += 2; parts.push({ label: "Home type set", delta: +2 }); }

  // Normalize
  score = clamp(Math.round(score));

  // Summary & tags
  const summary = [
    `${answers.full_name || "Unknown buyer"} — timeline: ${answers.timeline || "n/a"}, budget: ${answers.price_range || "n/a"}.`,
    hasAny(homeTypes) ? `Types: ${homeTypes.join(", ")}.` : "",
    musts.length ? `Musts: ${musts.join(", ")}.` : "",
    nos.length ? `No: ${nos.join(", ")}.` : "",
    answers.areas ? `Areas: ${answers.areas}.` : "",
    `Match score: ${score} (${parts.map(p => `${p.label} ${p.delta>0?"+":""}${p.delta}`).join(", ")})`,
  ].filter(Boolean).join(" ");

  const tags = [
    ...(homeTypes.slice(0, 3)),
    commute ? `⏱ ≤${commute}m` : "",
    cond ? cond : "",
  ].filter(Boolean);

  return { summary, tags, score };
}
