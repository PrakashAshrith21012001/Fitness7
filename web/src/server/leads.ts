import { promises as fs } from "node:fs";
import path from "node:path";
import { admin } from "./supabase";

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
 * Leads go into the Supabase `leads` table (server key — the table has no
 * public policy, so only this code can read or write it).
 *
 * Without SUPABASE_URL / SUPABASE_SECRET_KEY (local dev with no project yet)
 * they append to `web/.data/leads.jsonl` exactly as the prototype did.
 */
const STORE = path.join(process.cwd(), ".data", "leads.jsonl");

export async function appendLead(lead: Lead) {
  const c = admin();
  if (c) {
    const { error } = await c.from("leads").insert({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      interest: lead.interest ?? null,
      message: lead.message ?? null,
      source: lead.source,
      created_at: lead.createdAt,
    });
    if (!error) return;
    // Don't lose an enquiry because the database hiccuped — fall through to the file.
    console.error("leads: supabase insert failed, falling back to file", error.message);
  }
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.appendFile(STORE, JSON.stringify(lead) + "\n", "utf8");
}

export async function readLeads(limit = 100): Promise<Lead[]> {
  const c = admin();
  if (c) {
    const { data, error } = await c.from("leads").select("*").order("created_at", { ascending: false }).limit(limit);
    if (!error && data) {
      return data.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        phone: r.phone as string,
        interest: (r.interest as string | null) ?? undefined,
        message: (r.message as string | null) ?? undefined,
        source: r.source as Lead["source"],
        createdAt: r.created_at as string,
      }));
    }
  }
  try {
    const raw = await fs.readFile(STORE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Lead)
      .reverse()
      .slice(0, limit);
  } catch {
    return [];
  }
}
