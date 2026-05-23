import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { optimizeImageForUpload } from "@/lib/r2/optimizeUpload";
import { hasR2Config, normalizeR2Folder, uploadToR2 } from "@/lib/r2";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  if (!hasR2Config()) {
    return NextResponse.json(
      {
        error:
          "R2 is not configured. Add R2_ACCOUNT_ID (or R2_ENDPOINT), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL to .env.local.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderEntry = formData.get("folder");
    const folder = normalizeR2Folder(typeof folderEntry === "string" ? folderEntry : null);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP allowed." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be under 8MB before upload." }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const prepared = await optimizeImageForUpload(raw, file.type);

    if ("error" in prepared) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }

    const result = await uploadToR2(prepared.buffer, prepared.contentType, folder);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      url: result.url,
      key: result.key,
      optimized: prepared.optimized,
      width: prepared.width,
      height: prepared.height,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 400 });
  }
}
