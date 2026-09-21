import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { can, currentStaff } from "@/server/admin-auth";
import { admin } from "@/server/supabase";

export const runtime = "nodejs";

const MAX = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * POST multipart { file, folder? } — staff only. Stores in the public `media`
 * bucket and returns { url }. The browser resizes before sending; this just
 * checks type and size.
 */
export async function POST(request: Request) {
  const { staff } = await currentStaff();
  if (!can(staff, "admin")) return NextResponse.json({ error: "Sign in as an admin first." }, { status: 401 });
  const a = admin();
  if (!a) return NextResponse.json({ error: "Supabase isn't configured." }, { status: 503 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "JPEG, PNG or WebP only." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Keep photos under 5 MB." }, { status: 413 });
  const folder = String(form?.get("folder") ?? "treks").replace(/[^a-z0-9/-]/gi, "").slice(0, 80) || "treks";
  const path = `${folder}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await a.storage.from("media").upload(path, bytes, { contentType: file.type, upsert: false, cacheControl: "31536000" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data } = a.storage.from("media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
