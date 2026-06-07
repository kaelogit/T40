import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import EventSectionWrapper from "@/components/home/EventSectionWrapper";
import ShopByCategory from "@/components/home/ShopByCategory";
import NewArrivals from "@/components/home/NewArrivals";
import FlashSale from "@/components/home/FlashSale";
import TrendingNow from "@/components/home/TrendingNow";
import FragranceFinder from "@/components/home/FragranceFinder";
import GiftSets from "@/components/home/GiftSets";
import BrandStory from "@/components/home/BrandStory";
import { buildPageMetadata, SITE_NAME } from "@/lib/site/metadata";

export const metadata = buildPageMetadata({
  title: `${SITE_NAME} | Luxury Fragrances`,
  description:
    "Award-winning T40 Perfumes, designer fragrances, and gift sets. Shop online with delivery across Nigeria and selected countries.",
  path: "/",
  image: "/hero/sweet-noble.jpg",
});

export default function Home() {
  return (
    <div className="min-h-screen bg-t40-white">
      <Hero />
      <BestSellers />
      <EventSectionWrapper />
      <ShopByCategory />
      <NewArrivals />
      <FlashSale />
      <TrendingNow />
      <FragranceFinder />
      <GiftSets />
      <BrandStory />
    </div>
  );
}
