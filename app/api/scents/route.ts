import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadScentOptions } from "@/lib/shop/scents";

export async function GET() {
  const supabase = await createClient();
  const scents = await loadScentOptions(supabase);
  return NextResponse.json({ scents });
}
