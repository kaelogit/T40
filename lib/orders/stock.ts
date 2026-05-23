import { createAdminClient } from "@/lib/supabase/admin";

export async function decrementProductStockForOrder(orderId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const { data: product } = await supabase
      .from("products")
      .select("sales_count, stock_quantity")
      .eq("id", item.product_id)
      .maybeSingle();
    if (product) {
      const updates: { sales_count: number; stock_quantity?: number; in_stock?: boolean } = {
        sales_count: (product.sales_count ?? 0) + item.quantity,
      };
      if (product.stock_quantity != null) {
        const newQty = Math.max(0, product.stock_quantity - item.quantity);
        updates.stock_quantity = newQty;
        updates.in_stock = newQty > 0;
      }
      await supabase.from("products").update(updates).eq("id", item.product_id);
    }
  }
}
