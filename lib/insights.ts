// lib/insights.ts
// Generates a few plain-English insights from month-over-month category changes.

import { addMonths, yyyyMm } from "./date";
import { sumSpendByCategoryForMonth } from "../db/db";

export type Insight = {
  type: "increase" | "decrease";
  category: string;
  delta: number;           // absolute change (this - last)
  pct: number;             // percent change (vs last), whole number e.g., 32 for 32%
  because?: string;        // placeholder for merchant reason in future
  message: string;         // rendered output
};

export async function getCategoryInsights(activeMonth: Date): Promise<Insight[]> {
  const thisKey = yyyyMm(activeMonth);
  const lastKey = yyyyMm(addMonths(activeMonth, -1));

  const [thisRows, lastRows] = await Promise.all([
    sumSpendByCategoryForMonth(thisKey),
    sumSpendByCategoryForMonth(lastKey),
  ]);
  const lastMap = new Map(lastRows.map(r => [r.category || "Uncategorized", r.spend]));
  const out: Insight[] = [];

  for (const cur of thisRows) {
    const cat = cur.category || "Uncategorized";
    const prev = lastMap.get(cat) ?? 0;
    const delta = cur.spend - prev;
    if (prev === 0 && cur.spend === 0) continue;

    const pct = prev > 0 ? Math.round((delta / prev) * 100) : 100;
    // basic gates to avoid noise
    const bigEnough = Math.abs(delta) >= 25 && Math.abs(pct) >= 25;

    if (bigEnough) {
      const type = delta >= 0 ? "increase" : "decrease";
      const msg =
        type === "increase"
          ? `Spending in ${cat} is up ${pct}% ($${Math.abs(delta).toFixed(0)}) vs last month.`
          : `Spending in ${cat} is down ${Math.abs(pct)}% ($${Math.abs(delta).toFixed(0)}) vs last month.`;
      out.push({ type, category: cat, delta, pct: Math.abs(pct), message: msg });
    }
  }

  // limit to 3 insights max (top absolute deltas)
  out.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return out.slice(0, 3);
}
