import { notFound } from "next/navigation";
import CouponForm from "@/components/admin/CouponForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToCouponForm } from "@/lib/admin/couponForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("coupons").select("code").eq("id", id).maybeSingle();
  return { title: data ? `Edit ${data.code} | T40 Perfumes` : "Edit Coupon | T40 Perfumes" };
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">
        Edit {data.code}
      </h1>
      <CouponForm couponId={id} initial={rowToCouponForm(data)} />
    </div>
  );
}
