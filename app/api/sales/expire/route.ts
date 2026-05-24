import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expireFlashSales } from "@/lib/sales/expireFlashSales";

export async function POST() {
  try {
    const supabase = createAdminClient();
    const result = await expireFlashSales(supabase);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("expire sales:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to expire sales." },
      { status: 500 }
    );
  }
}
