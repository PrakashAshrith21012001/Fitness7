/** Liveness check — what the keep-alive ping (src/instrumentation.ts) calls. */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, at: new Date().toISOString() });
}
