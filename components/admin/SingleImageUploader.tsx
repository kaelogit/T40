"use client";

import ImageUploader from "./ImageUploader";

type Props = {
  image: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: "products" | "blog" | "content";
};

export default function SingleImageUploader({
  image,
  onChange,
  label = "Image",
  folder = "content",
}: Props) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">{label}</p>
      <ImageUploader
        images={image ? [image] : []}
        onChange={(urls) => onChange(urls[0] ?? "")}
        max={1}
        folder={folder}
      />
    </div>
  );
}
