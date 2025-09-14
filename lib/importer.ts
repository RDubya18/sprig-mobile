// lib/importer.ts
// Mint/CK-style CSV importer with dedupe & summary.
// Safe defaults: expects headers containing at least Date, Description, Amount.
// Optional: Category, Merchant.
// Dedupe key: `${date}|${amount}|${merchantOrDesc}` (case-insensitive).

import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { getExistingTxnSignatures, bulkInsertTransactions, TxInput } from "../db/db";

export type ImportSummary = {
  parsed: number;
  duplicates: number;
  inserted: number;
  skipped: number; // parsed - inserted
  sample?: boolean;
};

export type ParsedRow = {
  date: string;       // YYYY-MM-DD
  description?: string | null;
  merchant?: string | null;
  category?: string | null;
  amount: number;     // negative = spend
  account_id?: number | null;
};

function csvToRows(csv: string): ParsedRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(",").map(h => h.trim().toLowerCase());
  const idx = (name: string) => header.findIndex(h => h === name.toLowerCase());

  const iDate = [idx("date"), idx("posted date")].find(i => i >= 0) ?? -1;
  const iDesc = [idx("description"), idx("original description")].find(i => i >= 0) ?? -1;
  const iMerchant = [idx("merchant"), idx("payee")].find(i => i >= 0) ?? -1;
  const iCategory = [idx("category")].find(i => i >= 0) ?? -1;
  const iAmount = [idx("amount"), idx("transaction amount")].find(i => i >= 0) ?? -1;

  const out: ParsedRow[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = splitCsvLine(lines[r]);
    const rawDate = col(cols, iDate);
    const amountStr = col(cols, iAmount);
    if (!rawDate || !amountStr) continue;

    const date = normalizeDate(rawDate); // to YYYY-MM-DD
    if (!date) continue;

    const amount = Number(parseFloat(amountStr.replace(/[$,]/g, "")));
    if (Number.isNaN(amount)) continue;

    const row: ParsedRow = {
      date,
      description: col(cols, iDesc) || null,
      merchant: col(cols, iMerchant) || null,
      category: col(cols, iCategory) || null,
      amount,
      account_id: null,
    };
    out.push(row);
  }
  return out;
}

// Handles quoted CSV cells with commas
function splitCsvLine(line: string): string[] {
  const res: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' ) {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      res.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res.map(s => s.trim());
}

function col(cols: string[], idx: number) {
  return idx >= 0 && idx < cols.length ? cols[idx] : "";
}

function normalizeDate(s: string): string | null {
  // Accept MM/DD/YYYY, YYYY-MM-DD, YYYY/MM/DD
  const mmdd = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const ymd = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/;
  let y=0,m=0,d=0;
  if (mmdd.test(s)) {
    const m1 = s.match(mmdd)!;
    m = +m1[1]; d = +m1[2]; y = +m1[3];
  } else if (ymd.test(s)) {
    const m2 = s.match(ymd)!;
    y = +m2[1]; m = +m2[2]; d = +m2[3];
  } else {
    return null;
  }
  const mm = m < 10 ? `0${m}` : `${m}`;
  const dd = d < 10 ? `0${d}` : `${d}`;
  return `${y}-${mm}-${dd}`;
}

function signatureOf(p: ParsedRow): string {
  const key = (p.merchant || p.description || "").toLowerCase().trim();
  return `${p.date}|${p.amount}|${key}`;
}

export async function pickCsvAndImport(): Promise<ImportSummary> {
  const res = await DocumentPicker.getDocumentAsync({ type: "text/*", multiple: false });
  if (res.canceled || !res.assets?.length) {
    return { parsed: 0, duplicates: 0, inserted: 0, skipped: 0 };
  }
  const uri = res.assets[0].uri;
  const csv = await FileSystem.readAsStringAsync(uri, { encoding: "utf8" as any });

  return importFromCsv(csv, false);
}

export async function importSampleCsv(csv: string): Promise<ImportSummary> {
  return importFromCsv(csv, true);
}

async function importFromCsv(csv: string, sample: boolean): Promise<ImportSummary> {
  const parsed = csvToRows(csv);
  const signatures = parsed.map(signatureOf);
  const existing = await getExistingTxnSignatures(signatures);
  const existingSet = new Set(existing);

  const rowsToInsert: TxInput[] = [];
  let duplicates = 0;

  for (const r of parsed) {
    const sig = signatureOf(r);
    if (existingSet.has(sig)) { duplicates++; continue; }
    rowsToInsert.push({
      date: r.date,
      description: r.description ?? null,
      merchant: r.merchant ?? null,
      category: r.category ?? null,
      amount: r.amount,
      account_id: r.account_id ?? null,
    });
  }

  const inserted = await bulkInsertTransactions(rowsToInsert);
  const summary: ImportSummary = {
    parsed: parsed.length,
    duplicates,
    inserted,
    skipped: parsed.length - inserted,
    sample,
  };
  return summary;
}
