"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import JsBarcode from "jsbarcode";
import QRCode from "react-qr-code";
import { ArrowLeft, Printer } from "lucide-react";

export type BarcodePrintSize = "small" | "medium" | "large" | "sheet";

const SIZE_OPTIONS: { id: BarcodePrintSize; label: string; description: string }[] = [
  { id: "small", label: "Small", description: "38 × 25 mm label" },
  { id: "medium", label: "Medium", description: "50 × 50 mm label" },
  { id: "large", label: "Large", description: "80 × 80 mm label" },
  { id: "sheet", label: "Full sheet", description: "Centered on A4" },
];

const QR_SIZES: Record<BarcodePrintSize, number> = {
  small: 72,
  medium: 120,
  large: 180,
  sheet: 240,
};

type Props = {
  productName: string;
  productSlug: string;
  productUrl: string;
};

export default function ProductBarcodePrint({ productName, productSlug, productUrl }: Props) {
  const [size, setSize] = useState<BarcodePrintSize>("medium");
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, productUrl, {
        format: "CODE128",
        width: size === "small" ? 1.2 : size === "medium" ? 1.5 : 2,
        height: size === "small" ? 36 : size === "medium" ? 48 : 56,
        displayValue: false,
        margin: 0,
      });
    } catch {
      /* URL too long for some formats — QR remains primary */
    }
  }, [productUrl, size]);

  const qrSize = QR_SIZES[size];

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .admin-barcode-no-print {
            display: none !important;
          }
          .admin-barcode-print-root {
            padding: 0 !important;
            background: white !important;
          }
          .admin-barcode-print-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
          }
          .admin-barcode-print-area[data-size="sheet"] {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>

      <div className="admin-barcode-print-root max-w-3xl">
        <div className="admin-barcode-no-print mb-8 space-y-6">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black"
          >
            <ArrowLeft size={14} />
            Back to products
          </Link>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Product barcode</h1>
            <p className="text-sm text-neutral-500 mt-2 font-body">
              Scan the QR code or barcode to open this product on the store. Choose a label size,
              then print.
            </p>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
              Label size
            </p>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSize(option.id)}
                  className={`px-4 py-2 text-left border transition-colors ${
                    size === option.id
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white hover:border-neutral-400"
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-widest">
                    {option.label}
                  </span>
                  <span
                    className={`block text-[9px] mt-0.5 ${
                      size === option.id ? "text-white/70" : "text-neutral-400"
                    }`}
                  >
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d94625] transition-colors"
          >
            <Printer size={16} />
            Print barcode
          </button>
        </div>

        <div
          className="admin-barcode-print-area mx-auto bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center"
          data-size={size}
          style={{
            width:
              size === "small"
                ? "38mm"
                : size === "medium"
                  ? "50mm"
                  : size === "large"
                    ? "80mm"
                    : "100%",
            minHeight:
              size === "small"
                ? "25mm"
                : size === "medium"
                  ? "50mm"
                  : size === "large"
                    ? "80mm"
                    : undefined,
            padding:
              size === "small"
                ? "2mm"
                : size === "medium"
                  ? "3mm"
                  : size === "large"
                    ? "4mm"
                    : "12mm",
          }}
        >
          <p
            className="font-black uppercase tracking-tight text-black leading-tight w-full"
            style={{
              fontSize:
                size === "small" ? "6pt" : size === "medium" ? "7pt" : size === "large" ? "8pt" : "11pt",
              marginBottom: size === "small" ? "1mm" : "2mm",
            }}
          >
            {productName}
          </p>

          <div
            className="bg-white shrink-0"
            style={{ padding: size === "small" ? "1mm" : "2mm" }}
          >
            <QRCode
              value={productUrl}
              size={qrSize}
              level="M"
              bgColor="#ffffff"
              fgColor="#0a0a0a"
            />
          </div>

          <svg ref={barcodeRef} className="w-full max-w-full h-auto mt-1" />

          <p
            className="text-neutral-600 break-all w-full font-mono leading-snug"
            style={{
              fontSize:
                size === "small" ? "5pt" : size === "medium" ? "6pt" : size === "large" ? "7pt" : "9pt",
              marginTop: size === "small" ? "1mm" : "2mm",
            }}
          >
            {productUrl}
          </p>

          {size !== "small" && (
            <p
              className="text-neutral-400 uppercase tracking-widest"
              style={{
                fontSize: size === "medium" ? "5pt" : "6pt",
                marginTop: "1mm",
              }}
            >
              {productSlug}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
