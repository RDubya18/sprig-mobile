// lib/export.ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function writeTextFile(
  filename: string,
  contents: string,
  mime = "text/plain",
): Promise<string> {
  const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
  const path = dir + filename;
  await FileSystem.writeAsStringAsync(path, contents, { encoding: "utf8" as any });
  return path;
}

export async function shareFile(path: string) {
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(path);
    return true;
  }
  return false;
}

export async function shareCsv(filename: string, rows: any[]): Promise<boolean> {
  const header = rows.length ? Object.keys(rows[0]).join(",") + "\n" : "";
  const body = rows.map((r) => Object.values(r).join(",")).join("\n");
  const path = await writeTextFile(filename, header + body, "text/csv");
  return shareFile(path);
}

export async function shareJson(filename: string, data: any): Promise<boolean> {
  const path = await writeTextFile(filename, JSON.stringify(data, null, 2), "application/json");
  return shareFile(path);
}
