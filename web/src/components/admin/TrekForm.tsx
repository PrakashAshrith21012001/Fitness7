"use client";

import { useState } from "react";
import type { TrekRow } from "@f7/content";
import { Button, Field, Label, inputCls } from "@/components/admin/ui";

/**
 * The trek form. Plain inputs; photos are picked here, resized in the browser
 * to 1600 px, uploaded to /api/admin/upload, and their URLs travel with the
 * form as hidden fields. Nothing is saved until the green button.
 */

async function resize(file: File, max = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return new Promise((res) => canvas.toBlob((b) => res(b ?? file), "image/jpeg", 0.85));
}

async function upload(file: File, folder: string): Promise<string> {
  const blob = await resize(file);
  const fd = new FormData();
  fd.append("file", new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
  fd.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
  return json.url;
}

export function TrekForm({ trek, action }: { trek: TrekRow | null; action: (fd: FormData) => void | Promise<void> }) {
  const [cover, setCover] = useState<string>(trek?.cover_url ?? "");
  const [gallery, setGallery] = useState<string[]>(trek?.gallery ?? []);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const folder = `treks/${trek?.id ?? "new"}`;

  const pick = (multi: boolean) =>
    new Promise<File[]>((res) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.multiple = multi;
      input.onchange = () => res(Array.from(input.files ?? []));
      input.click();
    });

  const addCover = async () => {
    const [f] = await pick(false);
    if (!f) return;
    setBusy("cover");
    setErr(null);
    try {
      setCover(await upload(f, folder));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const addGallery = async () => {
    const files = await pick(true);
    if (!files.length) return;
    setBusy("gallery");
    setErr(null);
    try {
      const urls: string[] = [];
      for (const f of files.slice(0, 8)) urls.push(await upload(f, folder));
      setGallery((g) => [...g, ...urls].slice(0, 12));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const t = trek;
  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="id" value={t?.id ?? ""} />
      <input type="hidden" name="return" value={t ? `/admin/treks/${t.id}` : "/admin/treks/new"} />
      <input type="hidden" name="cover_url" value={cover} />
      <input type="hidden" name="gallery" value={gallery.join("\n")} />

      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <h2 className="font-display text-lg font-bold">The trek</h2>
          <Field label="Title">
            <input name="title" defaultValue={t?.title ?? ""} required maxLength={80} placeholder="Yercaud Sunrise Climb" className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Place">
              <input name="location" defaultValue={t?.location ?? ""} maxLength={80} placeholder="Yercaud, Salem" className={inputCls} />
            </Field>
            <Field label="Date">
              <input name="date" type="date" defaultValue={t?.date ?? ""} required className={inputCls} />
            </Field>
            <Field label="Timing" hint='e.g. "Day trip · 4:00 AM – 6:00 PM"'>
              <input name="duration_text" defaultValue={t?.duration_text ?? ""} maxLength={80} placeholder="Day trip · 4:00 AM – 6:00 PM" className={inputCls} />
            </Field>
            <Field label="Meeting point">
              <input name="meeting_point" defaultValue={t?.meeting_point ?? "Fitness 7 Gym"} maxLength={120} className={inputCls} />
            </Field>
            <Field label="Difficulty">
              <select name="difficulty" defaultValue={t?.difficulty ?? "Moderate"} className={inputCls}>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Challenging</option>
              </select>
            </Field>
            <Field label="Distance (km)">
              <input name="distance_km" type="number" step="0.5" min="0" defaultValue={t?.distance_km ?? ""} className={inputCls} />
            </Field>
            <Field label="Altitude (m)">
              <input name="altitude_m" type="number" min="0" defaultValue={t?.altitude_m ?? ""} className={inputCls} />
            </Field>
            <Field label="Slots">
              <input name="slots_total" type="number" min="1" max="500" defaultValue={t?.slots_total ?? 20} className={inputCls} />
            </Field>
            <Field label="Price — guests (₹)">
              <input name="price_inr" type="number" min="0" defaultValue={t?.price_inr ?? ""} className={inputCls} />
            </Field>
            <Field label="Price — members (₹)">
              <input name="member_price_inr" type="number" min="0" defaultValue={t?.member_price_inr ?? ""} className={inputCls} />
            </Field>
          </div>
          <Field label="Summary" hint="Two or three sentences — this is the text on the card.">
            <textarea name="summary" defaultValue={t?.summary ?? ""} rows={3} maxLength={600} className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Highlights" hint="One per line, up to 6.">
              <textarea name="highlights" defaultValue={(t?.highlights ?? []).join("\n")} rows={5} className={inputCls} placeholder={"Sunrise from Pagoda Point\nCoffee estate trail"} />
            </Field>
            <Field label="What's included" hint="One per line.">
              <textarea name="includes" defaultValue={(t?.includes ?? []).join("\n")} rows={5} className={inputCls} placeholder={"Transport from the gym\nBreakfast & lunch\nTrek lead + first aid"} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <h2 className="font-display text-lg font-bold">Photos</h2>
          <div>
            <Label>Cover photo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {cover ? <img src={cover} alt="" className="size-full object-cover" /> : null}
              </div>
              <div className="space-x-3">
                <Button type="button" variant="outline" onClick={addCover} disabled={busy !== null}>
                  {busy === "cover" ? "Uploading…" : cover ? "Replace" : "Choose photo"}
                </Button>
                {cover ? (
                  <button type="button" onClick={() => setCover("")} className="text-sm text-muted underline">
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <Label>Gallery</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {gallery.map((u) => (
                <div key={u} className="relative h-20 w-28 overflow-hidden rounded-lg bg-surface-2">
                  <img src={u} alt="" className="size-full object-cover" />
                  <button type="button" onClick={() => setGallery((g) => g.filter((x) => x !== u))} aria-label="Remove photo" className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/70 text-white text-xs">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={addGallery} disabled={busy !== null} className="h-20 w-28 rounded-lg border border-dashed border-line text-sm text-muted hover:border-lime/50">
                {busy === "gallery" ? "Uploading…" : "+ Add"}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">JPEG/PNG/WebP, resized to 1600 px before upload. Up to 12.</p>
          </div>
          {err ? <p className="text-sm text-red-300">{err}</p> : null}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 self-start">
        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <h2 className="font-display text-lg font-bold">Publish</h2>
          <Field label="Status" hint="Published = on the site and in the app. Cancelled keeps it visible as cancelled for people who reserved.">
            <select name="status" defaultValue={t?.status ?? "draft"} className={inputCls}>
              <option value="draft">Draft — only here</option>
              <option value="published">Published — live</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
          <Button type="submit" className="w-full" disabled={busy !== null}>
            {t ? "Save changes" : "Save trek"}
          </Button>
          <p className="text-xs text-muted">The web address is made from the title and date, e.g. <code>yercaud-sunrise-climb-oct-2026</code>, and doesn't change afterwards.</p>
        </section>
      </aside>
    </form>
  );
}
