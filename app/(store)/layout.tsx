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
      <div id="site-header" className="sticky top-0 z-50">
        <AnnouncementBarWrapper />
        <Navbar />
      </div>
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
