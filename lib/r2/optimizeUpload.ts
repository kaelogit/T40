import sharp from "sharp";

export type OptimizedUpload = {
  buffer: Buffer;
  contentType: string;
  optimized: boolean;
  width: number;
  height: number;
};

/** Longest edge for stored product/CMS images (enough for retina product pages). */
const MAX_EDGE = 2400;

/** Below this file size *and* dimension cap, upload the original bytes unchanged. */
const PASS_THROUGH_MAX_BYTES = 400_000;

const WEBP_QUALITY = 82;

function isAllowedType(contentType: string): boolean {
  return contentType === "image/jpeg" || contentType === "image/png" || contentType === "image/webp";
}

/**
 * Prepare an admin upload for R2:
 * - Large / high-resolution images → auto-orient, resize down, compress to WebP
 * - Already modest files → pass through unchanged (no upscaling, no forced re-encode)
 */
export async function optimizeImageForUpload(
  input: Buffer,
  contentType: string
): Promise<OptimizedUpload | { error: string }> {
  if (!isAllowedType(contentType)) {
    return { error: "Only JPEG, PNG, and WebP allowed." };
  }

  try {
    const meta = await sharp(input, { failOn: "none" }).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    if (!width || !height) {
      return { error: "Could not read image dimensions. Try a different file." };
    }

    const maxDim = Math.max(width, height);
    const canPassThrough = input.length <= PASS_THROUGH_MAX_BYTES && maxDim <= MAX_EDGE;

    if (canPassThrough) {
      return {
        buffer: input,
        contentType,
        optimized: false,
        width,
        height,
      };
    }

    let pipeline = sharp(input, { failOn: "none" }).rotate();

    if (maxDim > MAX_EDGE) {
      pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const optimizedBuffer = await pipeline
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    const optimizedMeta = await sharp(optimizedBuffer).metadata();

    // If compression didn't help, keep the original (e.g. already-optimized WebP).
    if (optimizedBuffer.length >= input.length) {
      return {
        buffer: input,
        contentType,
        optimized: false,
        width,
        height,
      };
    }

    return {
      buffer: optimizedBuffer,
      contentType: "image/webp",
      optimized: true,
      width: optimizedMeta.width ?? width,
      height: optimizedMeta.height ?? height,
    };
  } catch {
    return { error: "Could not process this image. Use JPEG, PNG, or WebP." };
  }
}
