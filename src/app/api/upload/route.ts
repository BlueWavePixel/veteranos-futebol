import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCoordinatorEmail } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limiter";

const MAX_LOGO_SIZE = 500 * 1024; // 500KB
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const email = await getCoordinatorEmail();
    if (!email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Rate limit: 20 uploads per IP per hour
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rl = checkRateLimit(`upload:${ip}`, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Demasiados uploads. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rawType = formData.get("type") as string;
    const type: "logo" | "photo" = rawType === "photo" ? "photo" : "logo";

    if (!file) {
      return NextResponse.json(
        { error: "Ficheiro é obrigatório" },
        { status: 400 }
      );
    }

    const maxSize = type === "logo" ? MAX_LOGO_SIZE : MAX_PHOTO_SIZE;
    if (file.size > maxSize) {
      const maxLabel = type === "logo" ? "500KB" : "2MB";
      return NextResponse.json(
        { error: `Ficheiro demasiado grande (máximo ${maxLabel} para ${type === "logo" ? "logótipos" : "fotos da equipa"})` },
        { status: 400 }
      );
    }

    // SVG removed: can contain inline scripts for stored XSS
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de ficheiro não suportado. Use JPG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }

    // Get file extension from mime type
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extMap[file.type] || "jpg";
    const filename = `${type}-${Date.now()}.${ext}`;

    // Upload to Vercel Blob (public store)
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
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
