import { NextResponse } from "next/server";
import { can, currentStaff } from "@/server/admin-auth";
import { istToday } from "@/server/admin-data";
import { collections } from "@/server/billing";
import { methodLabel } from "@/lib/billing";

export const dynamic = "force-dynamic";

/** GET /admin/collections/export?month=2026-11 → CSV of that month's payments (admin+). */
export async function GET(request: Request) {
  const { staff } = await currentStaff();
  const url = new URL(request.url);
  if (!can(staff, "admin")) return NextResponse.redirect(new URL("/admin/login", url));
  const q = url.searchParams.get("month") ?? "";
  const month = /^\d{4}-\d{2}$/.test(q) ? q : istToday().slice(0, 7);
  const { payments } = await collections(month);
  const cell = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [
    ["Receipt", "Paid on", "Member", "Phone", "Plan", "Valid from", "Valid till", "Method", "Reference", "Amount (INR)", "Recorded by", "Voided"],
    ...payments.map((p) => [
      p.receipt_no,
      p.paid_on,
      p.members?.name ?? "",
      p.members?.phone ?? "",
      p.memberships?.plan_name ?? "",
      p.memberships?.starts_on ?? "",
      p.memberships?.ends_on ?? "",
      methodLabel(p.method),
      p.reference ?? "",
      p.amount_inr,
      p.recorded_by_name,
      p.voided ? "yes" : "",
    ]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fitness7-collections-${month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
