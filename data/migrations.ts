// data/migrations.ts
import { exec, query } from "./sql";

type Migration = { id: number; up: string };

const MIGRATIONS: Migration[] = [
  {
    id: 1,
    up: `
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
      INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version','0');

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT,
        merchant TEXT,
        category TEXT,
        amount REAL NOT NULL,
        account_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern TEXT NOT NULL,
        match_type TEXT NOT NULL,
        category TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL UNIQUE,
        monthly_target REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goal_ledgers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        last_reconciled TEXT
      );
    `,
  },
  // Add future migrations here with id: 2, 3, ...
];

export async function getSchemaVersion(): Promise<number> {
  const rows = await query<{ value: string }>(
    `SELECT value FROM meta WHERE key='schema_version'`
  );
  return rows[0] ? Number(rows[0].value) : 0;
}

export async function setSchemaVersion(v: number): Promise<void> {
  await exec(
    `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)`,
    [String(v)]
  );
}

export async function runMigrations(): Promise<void> {
  // Ensure meta exists
  await exec(
    `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)`
  );
  const current = await getSchemaVersion();
  const pending = MIGRATIONS.filter(m => m.id > current).sort((a, b) => a.id - b.id);
  for (const m of pending) {
    await exec(m.up);
    await setSchemaVersion(m.id);
  }
}
