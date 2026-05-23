import type { SupabaseClient } from "@supabase/supabase-js";
import { loadBrandOptions } from "./brands";
import { SHOP_COLLECTIONS } from "./collections";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterGroupConfig = {
  id: string;
  title: string;
  type: "single" | "multi";
  options: FilterOption[];
};

type CategoryRow = {
  name: string;
  slug: string;
};

async function childrenOf(
  supabase: SupabaseClient,
  parentSlug: string
): Promise<CategoryRow[]> {
  const { data: parent } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parentSlug)
    .maybeSingle();

  if (!parent?.id) return [];

  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("parent_id", parent.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (data as CategoryRow[]) ?? [];
}

export async function loadFilterGroups(
  supabase: SupabaseClient
): Promise<FilterGroupConfig[]> {
  const [dbCollections, brands] = await Promise.all([
    childrenOf(supabase, "shop-all"),
    loadBrandOptions(supabase),
  ]);

  const dbBySlug = new Map(dbCollections.map((c) => [c.slug, c.name]));
  const collectionOptions = SHOP_COLLECTIONS.map(({ slug, label }) => ({
    label: dbBySlug.get(slug) ?? label,
    value: slug,
  }));

  return [
    {
      id: "collection",
      title: "Collections",
      type: "single",
      options: collectionOptions,
    },
    {
      id: "price",
      title: "Price Range",
      type: "single",
      options: [
        { label: "Under ₦50,000", value: "under-50k" },
        { label: "₦50k – ₦100k", value: "50k-100k" },
        { label: "₦100k – ₦200k", value: "100k-200k" },
        { label: "Above ₦200k", value: "above-200k" },
      ],
    },
    {
      id: "brand",
      title: "Brands",
      type: "multi",
      options: brands,
    },
    {
      id: "occasion",
      title: "Occasion",
      type: "multi",
      options: [
        { label: "Everyday", value: "everyday" },
        { label: "Office", value: "office" },
        { label: "Evening", value: "evening" },
        { label: "Date Night", value: "date" },
      ],
    },
  ];
}
