// lib/export.ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function writeTextFile(filename: string, contents: string, mime = "text/plain"): Promise<string> {
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
