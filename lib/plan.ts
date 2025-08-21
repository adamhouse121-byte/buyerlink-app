export const PLAN_LIMITS = {
  free: {
    maxForms: 1,
    monthlyResponses: 15,
    csv: false,
  },
  pro: {
    maxForms: Number.POSITIVE_INFINITY, // “unlimited”
    monthlyResponses: 100,
    csv: true,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export function limitsFor(plan?: string) {
  const key = (plan || "free") as PlanName;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.free;
}
