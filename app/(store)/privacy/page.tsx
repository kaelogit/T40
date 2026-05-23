import LegalPageContent from "@/components/legal/LegalPageContent";
import { privacyPolicy } from "@/lib/content/legal";

export const metadata = {
  title: "Privacy Policy | T40 Perfumes",
  description: "How T40 Perfumes collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return <LegalPageContent content={privacyPolicy} />;
}
