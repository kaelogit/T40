import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getGiftSetContents } from "@/lib/products/giftSets";
import { computeGiftSetAvailability } from "@/lib/products/giftSetAvailability";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Gift set ID required." }, { status: 400 });
  }

  const supabase = hasAdminClient() ? createAdminClient() : await createClient();
  const contents = await getGiftSetContents(supabase, id);

  if (contents.length < 2) {
    return NextResponse.json(
      { error: "Gift set is not configured.", canPurchase: false },
      { status: 400 }
    );
  }

  const availability = computeGiftSetAvailability(contents);
  return NextResponse.json(availability);
}
