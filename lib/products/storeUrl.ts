import { getSiteUrl } from "@/lib/utils";
import { getProductHref } from "./urls";

export function getAbsoluteProductUrl(product: {
  slug?: string | null;
  id: string;
}): string {
  return `${getSiteUrl()}${getProductHref(product)}`;
}
