import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Clears expired flash sales in the database (on_sale, sale_price, variant sale prices). */
export async function POST() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("expire_flash_sales");
    if (error) {
      console.error("expire_flash_sales:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("expire sales:", e);
    return NextResponse.json({ error: "Failed to expire sales." }, { status: 500 });
  }
}
