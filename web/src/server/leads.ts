import { promises as fs } from "node:fs";
import path from "node:path";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  interest?: string;
  message?: string;
  source: "website" | "app";
  createdAt: string;
};

/**
 * Leads are appended to a JSONL file so the prototype needs no database.
 * Swap `appendLead` for a Postgres / Supabase insert when the gym goes live —
 * nothing else in the app has to change.
 */
const STORE = path.join(process.cwd(), ".data", "leads.jsonl");

export async function appendLead(lead: Lead) {
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.appendFile(STORE, JSON.stringify(lead) + "\n", "utf8");
}

export async function readLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(STORE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Lead);
  } catch {
    return [];
  }
}
