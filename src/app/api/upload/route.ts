import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCoordinatorEmail } from "@/lib/auth/session";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB max

export async function POST(request: NextRequest) {
  try {
    const email = await getCoordinatorEmail();
    if (!email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Ficheiro é obrigatório" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ficheiro demasiado grande (máximo 5MB)" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de ficheiro não suportado. Use JPG, PNG, WebP, GIF ou SVG." },
        { status: 400 }
      );
    }

    // Get file extension from mime type
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
    };
    const ext = extMap[file.type] || "jpg";
    const filename = `${type || "image"}-${Date.now()}.${ext}`;

    // Upload directly to Vercel Blob (no sharp processing)
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Erro: ${error.message}`
            : "Erro ao processar imagem",
      },
      { status: 500 }
    );
  }
}
