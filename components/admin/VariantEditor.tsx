import type { VariantFormInput, PricingMode } from "@/lib/products/variants";

type ProductVariantFormRow = VariantFormInput;

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black";

type Props = {
  mode: PricingMode;
  onModeChange: (mode: PricingMode) => void;
  variants: ProductVariantFormRow[];
  onChange: (variants: ProductVariantFormRow[]) => void;
  /** Gift sets: price only — no size labels or multi-size mode */
  hideSizeFields?: boolean;
};

const emptyRow = (): ProductVariantFormRow => ({
  label: "",
  price: 0,
  sale_price: null,
  stock_quantity: null,
  low_stock_threshold: 5,
  is_default: false,
});

export default function VariantEditor({
  mode,
  onModeChange,
  variants,
  onChange,
  hideSizeFields = false,
}: Props) {
  const setRow = (index: number, patch: Partial<ProductVariantFormRow>) => {
    const next = variants.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange(next);
  };

  const addRow = () => {
    onChange([...variants, { ...emptyRow(), is_default: variants.length === 0 }]);
  };

  const removeRow = (index: number) => {
    if (variants.length <= 1) return;
    const next = variants.filter((_, i) => i !== index);
    if (!next.some((v) => v.is_default)) next[0].is_default = true;
    onChange(next);
  };

  const switchMode = (next: PricingMode) => {
    onModeChange(next);
    if (next === "single" && variants.length > 1) {
      const keep = variants.find((v) => v.is_default) ?? variants[0];
      onChange([{ ...keep, is_default: true }]);
    }
    if (next === "multi" && variants.length === 1) {
      onChange(variants);
    }
  };

  return (
    <div className="space-y-4">
      {!hideSizeFields && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["single", "Single price"],
              ["multi", "Multiple sizes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${
                mode === value ? "border-black bg-black text-white" : "border-neutral-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500 leading-relaxed">
        {hideSizeFields
          ? "Set the gift set price. It auto-fills from the combined price of included perfumes — adjust for bundle pricing if needed."
          : mode === "single"
            ? "One fixed price. Optionally add a size label (e.g. 50 ml) — leave blank if not applicable."
            : "Add each size with its exact price. Only sizes you add will appear on the storefront."}
      </p>

      <div className="space-y-3">
        {variants.map((row, index) => (
          <div
            key={row.id ?? `new-${index}`}
            className={`grid grid-cols-1 gap-3 border border-neutral-200 p-4 bg-white ${
              hideSizeFields ? "sm:grid-cols-2" : "sm:grid-cols-12"
            }`}
          >
            {!hideSizeFields && mode === "multi" && (
              <div className="sm:col-span-3">
                <label className={labelClass}>Size label</label>
                <input
                  required
                  value={row.label}
                  onChange={(e) => setRow(index, { label: e.target.value })}
                  placeholder="e.g. 50 ml"
                  className={inputClass}
                />
              </div>
            )}
            {!hideSizeFields && mode === "single" && (
              <div className="sm:col-span-3">
                <label className={labelClass}>Size label (optional)</label>
                <input
                  value={row.label}
                  onChange={(e) => setRow(index, { label: e.target.value })}
                  placeholder="e.g. 50 ml — or leave empty"
                  className={inputClass}
                />
              </div>
            )}
            <div className={hideSizeFields ? undefined : "sm:col-span-2"}>
              <label className={labelClass}>Price (₦)</label>
              <input
                type="number"
                required
                min={1}
                value={row.price || ""}
                onChange={(e) => setRow(index, { price: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            {!hideSizeFields && mode === "multi" && variants.length > 1 && (
              <div className="sm:col-span-2 flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="radio"
                    name="defaultVariant"
                    checked={row.is_default}
                    onChange={() =>
                      onChange(variants.map((v, i) => ({ ...v, is_default: i === index })))
                    }
                  />
                  <span className="text-[10px] font-bold uppercase">Default</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-[10px] font-bold uppercase text-red-600 pb-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {mode === "multi" && !hideSizeFields && (
        <button
          type="button"
          onClick={addRow}
          className="text-[10px] font-bold uppercase tracking-widest border border-neutral-300 px-4 py-2 hover:border-black"
        >
          + Add size
        </button>
      )}
    </div>
  );
}
