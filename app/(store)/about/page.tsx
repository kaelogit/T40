import AboutPageContent from "@/components/about/AboutPageContent";
import { getAboutPageData } from "@/lib/content/about";

export const metadata = {
  title: "About | T40 Perfumes",
  description:
    "T40 Perfumes — internationally award-winning fragrances including Re'Venge, Sweet Noble, and 24th Oud. Recognized in the UK, USA, and Nigeria.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const data = await getAboutPageData();
  return <AboutPageContent data={data} />;
}
