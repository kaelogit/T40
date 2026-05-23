import LegalPageContent from "@/components/legal/LegalPageContent";
import { termsOfService } from "@/lib/content/legal";

export const metadata = {
  title: "Terms of Service | T40 Perfumes",
  description: "Terms and conditions for using the T40 Perfumes website and purchasing our products.",
};

export default function TermsPage() {
  return <LegalPageContent content={termsOfService} />;
}
