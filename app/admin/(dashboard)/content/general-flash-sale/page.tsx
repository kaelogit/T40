import GeneralFlashSaleAdmin from "@/components/admin/content/GeneralFlashSaleAdmin";

export const metadata = { title: "General Flash Sale | T40 Perfumes" };

export default function GeneralFlashSaleAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">General flash sale</h1>
      <p className="text-sm text-neutral-500 mb-10">
        Run a site-wide discount with a custom homepage section and countdown.
      </p>
      <GeneralFlashSaleAdmin />
    </div>
  );
}
