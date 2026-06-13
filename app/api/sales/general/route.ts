import { NextResponse } from "next/server";
import { getLiveGeneralFlashSale } from "@/lib/content/generalFlashSale";

export async function GET() {
  const config = await getLiveGeneralFlashSale();
  return NextResponse.json({ sale: config });
}
