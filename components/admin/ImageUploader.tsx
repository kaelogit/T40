"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  folder?: "products" | "blog" | "content";
};

export default function ImageUploader({ images, onChange, max = 4, folder = "products" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);

    const remaining = max - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} images.`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        newUrls.push(data.url);
      }
      onChange([...images, ...newUrls].slice(0, max));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative aspect-square bg-neutral-100 border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 p-1 bg-black/70 text-white hover:bg-black"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-black text-white text-[8px] font-bold uppercase px-1.5 py-0.5">
                Primary
              </span>
            )}
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:border-black hover:text-black transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Upload size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />

      <p className="text-[10px] text-neutral-500">
        Up to {max} images · JPEG, PNG, WebP · Max 8MB each · Large photos are auto-compressed;
        smaller files are kept as-is · First image is the card thumbnail
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
