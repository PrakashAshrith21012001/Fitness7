/**
 * Keep-alive for Render's free plan — the same fix FirstGrade's API uses
 * (backend/src/server.js). A free service sleeps after 15 minutes without
 * inbound traffic and then takes ~30–60 s to wake. Once the server is up it
 * calls its own public URL every 4 minutes; that request comes back in through
 * Render's proxy, counts as traffic, and the service never goes idle.
 *
 * Runs only on Render (RENDER_EXTERNAL_URL is set there automatically), never
 * in `next dev` or on a laptop. A self-ping keeps a warm instance warm; it
 * can't wake one that is already asleep — a deploy or the first visit does that.
 *
 * Cost: an always-on free service uses ~730 of the 750 free instance-hours a
 * Render workspace gets each month. Two always-on free services in the same
 * workspace run out mid-month and Render suspends them until the 1st. Set
 * KEEP_ALIVE=off on Render to turn this off.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const base = process.env.RENDER_EXTERNAL_URL;
  if (!base || process.env.KEEP_ALIVE === "off") return;
  const ping = () => fetch(`${base}/api/health`, { cache: "no-store" }).catch(() => {});
  setInterval(ping, 4 * 60 * 1000);
  console.log(`Keep-alive ping active (every 4 min → ${base}/api/health)`);
}
