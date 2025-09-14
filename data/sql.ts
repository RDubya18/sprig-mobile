// data/sql.ts
import * as SQLite from "expo-sqlite/legacy";

// One handle per app
let db: SQLite.WebSQLDatabase | null = null;

export function openDb(): SQLite.WebSQLDatabase {
  if (!db) db = SQLite.openDatabase("sprig.db");
  return db!;
}

export type SQLParam = string | number | null;

export function exec(sql: string, params: SQLParam[] = []): Promise<void> {
  const database = openDb();
  return new Promise<void>((resolve, reject) => {
    database.transaction(
      tx => {
        tx.executeSql(
          sql,
          params,
          () => resolve(),
          (_tx, err) => { reject(err); return true; }
        );
      },
      err => reject(err)
    );
  });
}

export function query<T = any>(sql: string, params: SQLParam[] = []): Promise<T[]> {
  const database = openDb();
  return new Promise<T[]>((resolve, reject) => {
    database.readTransaction(
      tx => {
        tx.executeSql(
          sql,
          params,
          (_tx, { rows }) => {
            const out: T[] = [];
            for (let i = 0; i < rows.length; i++) out.push(rows.item(i));
            resolve(out);
          },
          (_tx, err) => { reject(err); return true; }
        );
      },
      err => reject(err)
    );
  });
}

export function tx<T>(fn: (tx: SQLite.SQLTransaction) => void): Promise<void> {
  const database = openDb();
  return new Promise<void>((resolve, reject) => {
    database.transaction(fn, err => reject(err), () => resolve());
  });
}
