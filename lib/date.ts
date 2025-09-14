// lib/date.ts
export function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return startOfMonth(x);
}
export function yyyyMm(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${m < 10 ? "0" + m : m}`;
}
export function formatMonthTitle(d: Date): string {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

import * as React from "react";
export type MonthState = {
  activeMonth: Date;
  setActiveMonth: (d: Date) => void;
  monthKey: string;
  monthTitle: string;
};
export const MonthContext = React.createContext<MonthState | null>(null);
export function useMonth(): MonthState {
  const ctx = React.useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within a MonthContext.Provider");
  return ctx;
}
