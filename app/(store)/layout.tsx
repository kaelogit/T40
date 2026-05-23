import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnnouncementBarWrapper from "@/components/layout/AnnouncementBarWrapper";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBarWrapper />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
