import type { Metadata } from "next";
import SearchPage from "@/components/search/SearchPage";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();

  return {
    title: term ? `Search: ${term} | T40 Perfumes` : "Search | T40 Perfumes",
    description: term
      ? `Search results for "${term}" at T40 Perfumes.`
      : "Search luxury fragrances at T40 Perfumes.",
  };
}

export default function Page() {
  return <SearchPage />;
}
