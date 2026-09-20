import type { Lead } from "./leads";

/**
 * WhatsApp Cloud API notifier.
 *
 * Phase 1 — unset env vars: this is a no-op, and every button on the site
 * already opens a pre-written wa.me chat, so nothing is lost.
 *
 * Phase 2 — set these in .env.local and the gym gets an instant WhatsApp
 * ping for every enquiry:
 *   WHATSAPP_TOKEN          permanent access token from Meta
 *   WHATSAPP_PHONE_ID       phone number ID from the WhatsApp dashboard
 *   WHATSAPP_OWNER_NUMBER   where alerts go, e.g. 919876543210
 */
const API_VERSION = "v21.0";

export function whatsappConfigured() {
  return Boolean(
    process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_ID &&
      process.env.WHATSAPP_OWNER_NUMBER,
  );
}

export async function notifyOwner(lead: Lead): Promise<void> {
  if (!whatsappConfigured()) return;

  const body = [
    "🟢 New enquiry — Fitness 7",
    "",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.interest ? `Interested in: ${lead.interest}` : null,
    lead.message ? `Message: ${lead.message}` : null,
    `Via: ${lead.source}`,
  ]
    .filter(Boolean)
    .join("\n");

  const url = `https://graph.facebook.com/${API_VERSION}/${process.env.WHATSAPP_PHONE_ID}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: process.env.WHATSAPP_OWNER_NUMBER,
        type: "text",
        text: { preview_url: false, body },
      }),
    });
    if (!res.ok) {
      console.error("WhatsApp notify failed", res.status, await res.text());
    }
  } catch (err) {
    // Never let a notification failure break the enquiry itself.
    console.error("WhatsApp notify threw", err);
  }
}
