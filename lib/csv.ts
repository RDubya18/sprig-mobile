import * as DocumentPicker from "expo-document-picker";
import Papa from "papaparse";

export type RawTx = {
  date: string;
  description: string;
  amount: string;
  category?: string;
  account?: string;
};

export async function pickAndParseCsv(): Promise<RawTx[]> {
  const res = await DocumentPicker.getDocumentAsync({ type: "text/csv" });

  if (res.canceled || !res.assets || res.assets.length === 0) {
    return [];
  }

  const file = res.assets[0]; // this has the uri
  const text = await fetch(file.uri).then(r => r.text());

  const { data } = Papa.parse<RawTx>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return data;
}

