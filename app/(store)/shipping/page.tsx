import LegalPageContent from "@/components/legal/LegalPageContent";
import { shippingAndReturns } from "@/lib/content/legal";

export const metadata = {
  title: "Shipping & Returns | T40 Perfumes",
  description: "Shipping times, delivery information, and return policy for T40 Perfumes orders.",
};

export default function ShippingPage() {
  return <LegalPageContent content={shippingAndReturns} />;
}
