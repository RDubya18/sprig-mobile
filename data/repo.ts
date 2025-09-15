// data/repo.ts
import { exec, query, tx, SQLParam } from "./sql";
import { runMigrations } from "./migrations";

export async function initDb(): Promise<void> {
  await runMigrations();
}

/** ---------- Budgets ---------- */
export async function getBudgets() {
  return query<{ id: number; category: string; monthly_target: number }>(
    `SELECT id, category, monthly_target FROM budgets ORDER BY category ASC`,
  );
}
export async function setBudget(category: string, monthly_target: number) {
  await exec(
    `INSERT INTO budgets (category, monthly_target)
     VALUES (?, ?)
     ON CONFLICT(category) DO UPDATE SET monthly_target=excluded.monthly_target`,
    [category, monthly_target],
  );
}

/** ---------- Rules ---------- */
export type RuleRow = {
  id: number;
  pattern: string;
  match_type: "contains" | "exact" | "regex";
  category: string;
};
export async function getRules(): Promise<RuleRow[]> {
  return query<RuleRow>(`SELECT id, pattern, match_type, category FROM rules ORDER BY id DESC`);
}
export async function addRule(input: {
  pattern: string;
  match_type: "contains" | "exact" | "regex";
  category: string;
}) {
  await exec(`INSERT INTO rules (pattern, match_type, category) VALUES (?,?,?)`, [
    input.pattern,
    input.match_type,
    input.category,
  ]);
}
// Back-compat call signature
export async function addRuleCompat(
  matchType: "contains" | "exact" | "regex",
  pattern: string,
  category: string,
) {
  await addRule({ match_type: matchType, pattern, category });
}
export async function deleteRule(id: number) {
  await exec(`DELETE FROM rules WHERE id=?`, [id]);
}
export async function applyRulesToUncategorized(): Promise<number> {
  // TODO: implement categorization pass
  return 0;
}

/** ---------- Transactions ---------- */
export type TxRow = {
  id: number;
  date: string;
  description: string | null;
  merchant: string | null;
  category: string | null;
  amount: number;
  account_id: number | null;
};
function monthFilterSql(monthKey?: string) {
  return monthKey ? ` AND substr(date,1,7)=? ` : ` `;
}

export async function getTransactions(
  monthKey?: string,
  opts?: { search?: string; category?: string },
): Promise<TxRow[]> {
  const where: string[] = ["1=1"];
  const args: SQLParam[] = [];
  if (monthKey) {
    where.push(`substr(date,1,7)=?`);
    args.push(monthKey);
  }
  if (opts?.category) {
    where.push(`category=?`);
    args.push(opts.category);
  }
  if (opts?.search) {
    where.push(`(merchant LIKE ? OR description LIKE ?)`);
    args.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  return query<TxRow>(
    `SELECT id, date, description, merchant, category, amount, account_id
     FROM transactions WHERE ${where.join(" AND ")}
     ORDER BY date DESC, id DESC`,
    args,
  );
}

export async function getDistinctCategories(monthKey?: string) {
  return query<{ category: string }>(
    `SELECT DISTINCT category
     FROM transactions
     WHERE 1=1 ${monthFilterSql(monthKey)}
       AND category IS NOT NULL AND category <> ''
     ORDER BY category ASC`,
    monthKey ? [monthKey] : [],
  );
}

export async function sumSpentForMonth(monthKey: string): Promise<number> {
  const rows = await query<{ spend: number }>(
    `SELECT COALESCE(ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)), 0) AS spend
     FROM transactions WHERE substr(date,1,7)=?`,
    [monthKey],
  );
  return rows[0]?.spend ?? 0;
}

export async function sumSpendByCategoryForMonth(monthKey: string) {
  return query<{ category: string; spend: number }>(
    `SELECT category AS category,
            COALESCE(ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)), 0) AS spend
     FROM transactions
     WHERE substr(date,1,7)=?
     GROUP BY category
     HAVING spend > 0
     ORDER BY spend DESC`,
    [monthKey],
  );
}

export async function getExistingTxnSignatures(signatures: string[]): Promise<string[]> {
  if (!signatures.length) return [];
  const placeholders = signatures.map(() => "?").join(",");
  const rows = await query<{ sig: string }>(
    `SELECT date || '|' || amount || '|' || LOWER(COALESCE(merchant, description, '')) AS sig
     FROM transactions
     WHERE (date || '|' || amount || '|' || LOWER(COALESCE(merchant, description, ''))) IN (${placeholders})`,
    signatures,
  );
  return rows.map((r) => r.sig);
}

export type TxInput = {
  date: string;
  description: string | null;
  merchant: string | null;
  category: string | null;
  amount: number;
  account_id: number | null;
};
export async function bulkInsertTransactions(rows: TxInput[]): Promise<number> {
  if (!rows.length) return 0;
  const database = (await import("expo-sqlite/legacy")).openDatabase("sprig.db"); // local handle for speed
  return new Promise<number>((resolve, reject) => {
    database.transaction(
      (tx) => {
        for (const r of rows) {
          tx.executeSql(
            `INSERT INTO transactions (date, description, merchant, category, amount, account_id)
             VALUES (?,?,?,?,?,?)`,
            [r.date, r.description, r.merchant, r.category, r.amount, r.account_id ?? null],
          );
        }
      },
      (err) => reject(err),
      () => resolve(rows.length),
    );
  });
}
// Back-compat alias
export const insertTransactions = bulkInsertTransactions;

/** ---------- Accounts ---------- */
export type Account = {
  id: number;
  name: string;
  type: string;
  balance: number;
  last_reconciled: string | null;
};
export async function getAccounts(): Promise<Account[]> {
  return query<Account>(
    `SELECT id, name, type, balance, last_reconciled FROM accounts ORDER BY name ASC`,
  );
}
export async function getAccount(id: number): Promise<Account | null> {
  const rows = await query<Account>(
    `SELECT id, name, type, balance, last_reconciled FROM accounts WHERE id=?`,
    [id],
  );
  return rows[0] ?? null;
}
export async function createAccount(input: {
  name: string;
  type: string;
  balance?: number;
  last_reconciled?: string | null;
}) {
  await exec(`INSERT INTO accounts (name, type, balance, last_reconciled) VALUES (?,?,?,?)`, [
    input.name,
    input.type,
    input.balance ?? 0,
    input.last_reconciled ?? null,
  ]);
}
export async function updateAccount(
  id: number,
  patch: Partial<{ name: string; type: string; balance: number; last_reconciled: string | null }>,
) {
  const sets: string[] = [];
  const args: SQLParam[] = [];
  if (patch.name !== undefined) {
    sets.push(`name=?`);
    args.push(patch.name);
  }
  if (patch.type !== undefined) {
    sets.push(`type=?`);
    args.push(patch.type);
  }
  if (patch.balance !== undefined) {
    sets.push(`balance=?`);
    args.push(patch.balance);
  }
  if (patch.last_reconciled !== undefined) {
    sets.push(`last_reconciled=?`);
    args.push(patch.last_reconciled);
  }
  if (!sets.length) return;
  args.push(id);
  await exec(`UPDATE accounts SET ${sets.join(", ")} WHERE id=?`, args);
}
export async function getAccountDeltaFromTransactions(accountId: number): Promise<number> {
  const rows = await query<{ net: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS net FROM transactions WHERE account_id = ?`,
    [accountId],
  );
  return rows[0]?.net ?? 0;
}

/** ---------- Export helpers ---------- */
export async function getAllTransactions() {
  return query(
    `SELECT id, date, description, merchant, category, amount, account_id FROM transactions ORDER BY date ASC, id ASC`,
  );
}
export async function getAllBudgets() {
  return query(`SELECT id, category, monthly_target FROM budgets ORDER BY category ASC`);
}
export async function getAllRules() {
  return query(`SELECT id, pattern, match_type, category FROM rules ORDER BY id ASC`);
}
export async function getAllGoals() {
  return query(`SELECT id, name, target FROM goals ORDER BY id ASC`);
}
