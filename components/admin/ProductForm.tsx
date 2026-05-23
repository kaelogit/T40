"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import GiftSetPicker from "./GiftSetPicker";
import VariantEditor from "./VariantEditor";
import FlashSaleEditor from "./FlashSaleEditor";
import { nameToSlug } from "@/lib/products/slug";
import {
  OCCASION_OPTIONS,
  SCENT_OPTIONS,
  getProductFormErrors,
  GIFT_SET_DEFAULT_BRAND,
  MIN_PRODUCT_DESCRIPTION_LENGTH,
  type ProductFormInput,
} from "@/lib/admin/productForm";
import {
  categoryHasSubcategories,
  SINGLE_PRODUCT_CATEGORY_OPTIONS,
  T40_HOUSE_BRAND,
} from "@/lib/catalog/productCategories";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className={labelClass}>
      {children}
      {required && <span className="text-red-600"> *</span>}
    </label>
  );
}

type Brand = { id: string; name: string; slug: string };

const emptyForm: ProductFormInput = {
  name: "",
  slug: "",
  brand: "",
  category: "unisex",
  subcategory: null,
  scentSlug: "",
  occasion: null,
  description: null,
  pricingMode: "single",
  variants: [
    {
      label: "",
      price: 0,
      sale_price: null,
      stock_quantity: null,
      low_stock_threshold: 5,
      is_default: true,
    },
  ],
  in_stock: true,
  stock_quantity: null,
  low_stock_threshold: 5,
  placement: "none",
  flash_sale: false,
  flash_sale_days: 7,
  images: [],
  giftSetProductIds: [],
};

type Props = {
  productId?: string;
  initial?: ProductFormInput;
};

function descriptionHint(length: number): string {
  return `${length}/${MIN_PRODUCT_DESCRIPTION_LENGTH} characters minimum`;
}

export default function ProductForm({ productId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInput>(() => ({ ...emptyForm, ...initial }));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrand, setNewBrand] = useState("");
  const [useNewBrand, setUseNewBrand] = useState(false);
  const [slugManual, setSlugManual] = useState(Boolean(initial?.slug));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<{ label: string; value: string }[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
  const [useNewSubcategory, setUseNewSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [subcategorySaving, setSubcategorySaving] = useState(false);

  const showSubcategories = categoryHasSubcategories(form.category);
  const trackStock = form.stock_quantity != null;
  const isGiftSet = form.category === "gift-sets";
  const isT40Exclusive = form.category === "t40-exclusives";
  const brandLockedToHouse = isGiftSet || isT40Exclusive;

  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []));
  }, []);

  const loadSubcategories = useCallback(async (category: string) => {
    setSubcategoriesLoading(true);
    setSubcategoryError(null);
    try {
      const res = await fetch(`/api/admin/subcategories?parent=${encodeURIComponent(category)}`);
      const d = (await res.json()) as {
        subcategories?: { name: string; slug: string }[];
        error?: string;
      };
      if (!res.ok) throw new Error(d.error ?? "Could not load subcategories.");
      setSubcategories(
        (d.subcategories ?? []).map((s) => ({
          label: s.name,
          value: s.slug,
        }))
      );
    } catch (err) {
      setSubcategories([]);
      setSubcategoryError(err instanceof Error ? err.message : "Could not load subcategories.");
    } finally {
      setSubcategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showSubcategories) {
      setSubcategories([]);
      setUseNewSubcategory(false);
      setNewSubcategoryName("");
      return;
    }
    loadSubcategories(form.category);
  }, [form.category, showSubcategories, loadSubcategories]);

  const createSubcategory = async () => {
    const name = newSubcategoryName.trim();
    if (!name || !showSubcategories) return;

    setSubcategorySaving(true);
    setSubcategoryError(null);
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_category: form.category,
          name,
          sort_order: subcategories.length,
        }),
      });
      const d = (await res.json()) as { subcategory?: { slug: string }; error?: string };
      if (!res.ok) throw new Error(d.error ?? "Could not create subcategory.");

      await loadSubcategories(form.category);
      set("subcategory", d.subcategory?.slug ?? nameToSlug(name));
      setUseNewSubcategory(false);
      setNewSubcategoryName("");
    } catch (err) {
      setSubcategoryError(err instanceof Error ? err.message : "Could not create subcategory.");
    } finally {
      setSubcategorySaving(false);
    }
  };

  useEffect(() => {
    if (!slugManual && form.name) {
      setForm((f) => ({ ...f, slug: nameToSlug(form.name) }));
    }
  }, [form.name, slugManual]);

  const set = <K extends keyof ProductFormInput>(key: K, value: ProductFormInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const applyCategoryChange = (category: string) => {
    if (category === "t40-exclusives") {
      setUseNewBrand(false);
    }
    setUseNewSubcategory(false);
    setNewSubcategoryName("");
    setSubcategoryError(null);
    setForm((f) => {
      const next: ProductFormInput = {
        ...f,
        category,
        subcategory: categoryHasSubcategories(category) ? f.subcategory : null,
      };
      if (category === "gift-sets") {
        const keep = f.variants.find((v) => v.is_default) ?? f.variants[0];
        next.brand = GIFT_SET_DEFAULT_BRAND;
        next.placement = "none";
        next.flash_sale = false;
        next.pricingMode = "single";
        next.variants = [
          {
            ...(keep ?? emptyForm.variants[0]),
            label: "",
            sale_price: null,
            is_default: true,
          },
        ];
      } else if (category === "t40-exclusives") {
        next.brand = T40_HOUSE_BRAND;
      }
      return next;
    });
  };

  const handleGiftSetChange = (ids: string[], suggestedPrice: number) => {
    setForm((f) => {
      const current = f.variants[0] ?? emptyForm.variants[0];
      return {
        ...f,
        giftSetProductIds: ids,
        pricingMode: "single",
        variants: [
          {
            ...current,
            label: "",
            price: suggestedPrice > 0 ? suggestedPrice : current.price,
            is_default: true,
          },
        ],
      };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);

    const payload: ProductFormInput = {
      ...form,
      brand: brandLockedToHouse
        ? GIFT_SET_DEFAULT_BRAND
        : useNewBrand
          ? newBrand.trim()
          : form.brand,
      placement: isGiftSet ? "none" : form.placement,
      flash_sale: isGiftSet ? false : form.flash_sale,
      variants: isGiftSet
        ? form.variants.map((v) => ({ ...v, label: "", sale_price: null }))
        : form.variants,
      newBrandName: useNewBrand && !brandLockedToHouse ? newBrand.trim() : undefined,
    } as ProductFormInput & { newBrandName?: string };

    const errors = getProductFormErrors(payload);
    if (errors.length) {
      setValidationErrors(errors);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-10">
      {(validationErrors.length > 0 || error) && (
        <div className="p-4 border border-red-200 bg-red-50 text-sm text-red-800 space-y-2">
          {validationErrors.length > 0 && (
            <>
              <p className="font-bold">Please fix the following before saving:</p>
              <ul className="list-disc pl-5 space-y-1">
                {validationErrors.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </>
          )}
          {error && <p>{error}</p>}
        </div>
      )}

      <div className="p-4 border border-neutral-200 bg-neutral-50/80 text-xs text-neutral-600 leading-relaxed">
        <p className="font-bold uppercase tracking-widest text-[10px] text-neutral-500 mb-2">
          Required to publish
        </p>
        {isGiftSet ? (
          <p>
            Gift set name, URL slug, description (at least {MIN_PRODUCT_DESCRIPTION_LENGTH}{" "}
            characters), price, at least one photo, and at least 2 perfumes in the set.
          </p>
        ) : (
          <p>
            Name, slug, brand, description (at least {MIN_PRODUCT_DESCRIPTION_LENGTH} characters),
            scent profile, occasion, price, at least one image
            {showSubcategories ? ", and subcategory" : ""}.
          </p>
        )}
      </div>

      {isGiftSet ? (
        <section className="space-y-5">
          <h2 className="text-sm font-black uppercase tracking-widest border-b border-neutral-200 pb-3">
            Gift set details
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FieldLabel required>Gift set name</FieldLabel>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. The Signature Trio"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>URL slug</FieldLabel>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  set("slug", e.target.value);
                }}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>Description</FieldLabel>
              <textarea
                rows={6}
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value || null)}
                placeholder="What's in this set, who it's for, and why it's a great gift — at least 200 characters."
                className={`${inputClass} resize-y`}
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                {descriptionHint((form.description ?? "").trim().length)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-neutral-500 mb-3">
                <span className="text-red-600">*</span> Select at least 2 perfumes for this gift set.
              </p>
              <GiftSetPicker
                selectedIds={form.giftSetProductIds}
                onChange={handleGiftSetChange}
                excludeProductId={productId}
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="space-y-5">
            <h2 className="text-sm font-black uppercase tracking-widest border-b border-neutral-200 pb-3">
              Product details
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <FieldLabel required>Name</FieldLabel>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel required>Slug</FieldLabel>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    set("slug", e.target.value);
                  }}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel required>Description</FieldLabel>
                <textarea
                  rows={6}
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value || null)}
                  placeholder="Describe the scent, who it's for, and what makes it special — at least 200 characters."
                  className={`${inputClass} resize-y`}
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  {descriptionHint((form.description ?? "").trim().length)}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-sm font-black uppercase tracking-widest border-b border-neutral-200 pb-3">
              Category & brand
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Category</FieldLabel>
                <select
                  value={form.category}
                  onChange={(e) => applyCategoryChange(e.target.value)}
                  className={inputClass}
                >
                  {SINGLE_PRODUCT_CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 mt-1">
                  {isT40Exclusive
                    ? "T40 Exclusives require a subcategory — pick one or add a new one below."
                    : "Manage all subcategories in "}
                  {!isT40Exclusive && (
                    <a href="/admin/subcategories" className="underline hover:text-black">
                      Subcategories
                    </a>
                  )}
                </p>
              </div>
              {showSubcategories && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useNewSubcategory}
                      onChange={(e) => {
                        setUseNewSubcategory(e.target.checked);
                        setSubcategoryError(null);
                      }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Add new subcategory
                    </span>
                  </label>

                  {useNewSubcategory ? (
                    <div className="space-y-2">
                      <FieldLabel required>Subcategory name</FieldLabel>
                      <div className="flex gap-2">
                        <input
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          placeholder="e.g. Oud Perfume"
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={createSubcategory}
                          disabled={subcategorySaving || !newSubcategoryName.trim()}
                          className="shrink-0 px-4 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                          {subcategorySaving ? "Adding…" : "Add"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FieldLabel required>Subcategory</FieldLabel>
                      <div className="relative">
                        <select
                          value={form.subcategory ?? ""}
                          onChange={(e) => set("subcategory", e.target.value || null)}
                          disabled={subcategoriesLoading}
                          className={`${inputClass} disabled:opacity-60`}
                        >
                          <option value="">
                            {subcategoriesLoading ? "Loading subcategories…" : "Select…"}
                          </option>
                          {subcategories.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {subcategoriesLoading && (
                          <Loader2
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-400 pointer-events-none"
                          />
                        )}
                      </div>
                    </>
                  )}

                  {subcategoryError && (
                    <p className="text-xs text-red-600">{subcategoryError}</p>
                  )}

                  {!useNewSubcategory && !subcategoriesLoading && subcategories.length === 0 && (
                    <p className="text-xs text-neutral-500">
                      No subcategories yet — check &quot;Add new subcategory&quot; above.
                    </p>
                  )}

                  <p className="text-[10px] text-neutral-400">
                    Or manage all subcategories in{" "}
                    <a href="/admin/subcategories" className="underline hover:text-black">
                      Subcategories
                    </a>
                    .
                  </p>
                </div>
              )}
              <div>
                <FieldLabel required>Scent profile</FieldLabel>
                <select
                  value={form.scentSlug}
                  onChange={(e) => set("scentSlug", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select scent...</option>
                  {SCENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel required>Occasion</FieldLabel>
                <select
                  value={form.occasion ?? ""}
                  onChange={(e) => set("occasion", e.target.value || null)}
                  className={inputClass}
                >
                  <option value="">Select occasion...</option>
                  {OCCASION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-3">
                {brandLockedToHouse ? (
                  <>
                    <FieldLabel required>Brand</FieldLabel>
                    <p className="border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium">
                      {T40_HOUSE_BRAND}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {isT40Exclusive
                        ? "T40 Exclusives are always listed under the house brand."
                        : "Gift sets use the house brand."}
                    </p>
                  </>
                ) : (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useNewBrand}
                        onChange={(e) => setUseNewBrand(e.target.checked)}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Add new brand
                      </span>
                    </label>
                    {useNewBrand ? (
                      <>
                        <FieldLabel required>Brand name</FieldLabel>
                        <input
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          placeholder="Brand name"
                          className={inputClass}
                        />
                      </>
                    ) : (
                      <>
                        <FieldLabel required>Brand</FieldLabel>
                        <select
                          value={form.brand}
                          onChange={(e) => set("brand", e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select brand...</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Pricing */}
      <section className="space-y-5">
        <h2 className="text-sm font-black uppercase tracking-widest border-b border-neutral-200 pb-3">
          {isGiftSet ? "Gift set price" : "Pricing & sizes"}
        </h2>
        <p className="text-xs text-neutral-500">
          {isGiftSet
            ? "Price is required — updates when you add or remove perfumes above."
            : "Price is required — must be greater than zero."}
        </p>
        <VariantEditor
          mode={isGiftSet ? "single" : form.pricingMode}
          onModeChange={(mode) => set("pricingMode", mode)}
          variants={form.variants}
          onChange={(variants) => set("variants", variants)}
          hideSizeFields={isGiftSet}
        />
      </section>

      {!isGiftSet && (
        <FlashSaleEditor
          enabled={form.flash_sale}
          onEnabledChange={(flash_sale) => set("flash_sale", flash_sale)}
          days={form.flash_sale_days}
          onDaysChange={(flash_sale_days) => set("flash_sale_days", flash_sale_days)}
          variants={form.variants}
          onVariantsChange={(variants) => set("variants", variants)}
        />
      )}

      {isGiftSet && (
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest border-b border-neutral-200 pb-3">
            Availability
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Customers can purchase when this gift set is listed in stock and enough included perfumes
            are available.
          </p>
          <label className="flex items-center gap-3 cursor-pointer border border-neutral-200 px-4 py-3 w-fit">
            <input
              type="checkbox"
              checked={form.in_stock}
              onChange={(e) => set("in_stock", e.target.checked)}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider">Listed as in stock</span>
          </label>
        </section>
      )}

      {!isGiftSet && (
      <>
      <section className="space-y-5">
        <h2 className="text-sm font-black uppercase tracking-widest border-b border-neutral-200 pb-3">
          Storefront placement
        </h2>
        <p className="text-xs text-neutral-500">
          Controls homepage sections and shop collection filters. Only one collection placement
          at a time.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["none", "None"],
              ["new-arrival", "New Arrivals"],
              ["best-seller", "Best Sellers"],
              ["trending", "Trending Now"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`flex items-center gap-3 border px-4 py-3 cursor-pointer ${
                form.placement === value ? "border-black bg-neutral-50" : "border-neutral-200"
              }`}
            >
              <input
                type="radio"
                name="placement"
                checked={form.placement === value}
                onChange={() => set("placement", value)}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
            </label>
          ))}
        </div>

        <div className="border border-neutral-200 p-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Inventory
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={trackStock}
              onChange={(e) => {
                if (e.target.checked) {
                  setForm((f) => ({
                    ...f,
                    stock_quantity: f.stock_quantity ?? 0,
                    in_stock: (f.stock_quantity ?? 0) > 0,
                  }));
                } else {
                  setForm((f) => ({ ...f, stock_quantity: null }));
                }
              }}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Track stock quantity
            </span>
          </label>
          {trackStock ? (
            <div className="grid sm:grid-cols-2 gap-4 pl-6">
              <div>
                <label className={labelClass}>Quantity in stock</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.stock_quantity ?? 0}
                  onChange={(e) => {
                    const qty = Math.max(0, Number(e.target.value));
                    setForm((f) => ({
                      ...f,
                      stock_quantity: qty,
                      in_stock: qty > 0,
                    }));
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Low stock alert at</label>
                <input
                  type="number"
                  min={1}
                  value={form.low_stock_threshold}
                  onChange={(e) => set("low_stock_threshold", Math.max(1, Number(e.target.value)))}
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <label className="flex items-center gap-3 cursor-pointer pl-6">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) => set("in_stock", e.target.checked)}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider">In stock</span>
            </label>
          )}
        </div>
      </section>
      </>
      )}

      {/* Images */}
      <section className="space-y-5">
        <h2 className="text-sm font-black uppercase tracking-widest border-b border-neutral-200 pb-3">
          Images
        </h2>
        <p className="text-xs text-neutral-500">
          <span className="text-red-600">*</span> At least one product photo — up to 4 images.
        </p>
        <ImageUploader images={form.images} onChange={(images) => set("images", images)} />
      </section>

      {error && validationErrors.length === 0 && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d94625] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {productId ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border border-neutral-300 hover:border-black"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
