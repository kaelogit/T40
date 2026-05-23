import CouponForm from "@/components/admin/CouponForm";

export const metadata = { title: "New Coupon | T40 Perfumes" };

export default function NewCouponPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">New coupon</h1>
      <CouponForm />
    </div>
  );
}
