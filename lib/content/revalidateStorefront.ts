import { revalidatePath } from "next/cache";

/** Bust cached layout (announcement bar, header) after CMS updates. */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}
