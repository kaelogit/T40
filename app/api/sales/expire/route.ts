import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expireGeneralFlashSaleIfNeeded } from "@/lib/content/generalFlashSale";
import { expireFlashSales } from "@/lib/sales/expireFlashSales";

export async function POST() {
  try {
    const supabase = createAdminClient();
    const generalExpired = await expireGeneralFlashSaleIfNeeded();
    const result = await expireFlashSales(supabase);
    return NextResponse.json({ ok: true, generalExpired, ...result });
  } catch (e) {
    console.error("expire sales:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to expire sales." },
      { status: 500 }
    );
  }
}