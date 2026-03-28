import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { getCoordinatorEmail } from "@/lib/auth/session";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB input max
const OUTPUT_WIDTH = 400; // Resize to max 400px width
const OUTPUT_QUALITY = 80; // JPEG quality

export async function POST(request: NextRequest) {
  try {
    const email = await getCoordinatorEmail();
    if (!email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "logo" or "photo"

    if (!file) {
      return NextResponse.json(
        { error: "Ficheiro é obrigatório" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ficheiro demasiado grande (máximo 10MB)" },
        { status: 400 }
      );
    }

    // Read file and resize with Sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(buffer)
      .resize(OUTPUT_WIDTH, OUTPUT_WIDTH, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: OUTPUT_QUALITY })
      .toBuffer();

    // Upload to Vercel Blob
    const filename = `${type || "image"}-${Date.now()}.jpg`;
    const blob = await put(filename, resized, {
      access: "public",
      contentType: "image/jpeg",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erro ao processar imagem" },
      { status: 500 }
    );
  }
}
