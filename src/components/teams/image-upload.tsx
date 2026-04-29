"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/i18n/translations";

type ImageUploadProps = {
  name: string;
  label: string;
  currentUrl?: string | null;
  type: "logo" | "photo";
};

function getClientLocale(): Locale {
  if (typeof document === "undefined") return "pt";
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "pt" || val === "br" || val === "es" || val === "en") return val;
  return "pt";
}

export function ImageUpload({
  name,
  label,
  currentUrl,
  type,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = getClientLocale();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const resp = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await resp.json();
      if (data.url) {
        setUploadedUrl(data.url);
        setPreview(data.url);
      } else {
        alert(data.error || t("imageUpload", "error", locale));
        setPreview(currentUrl || null);
      }
    } catch {
      alert(t("imageUpload", "error", locale));
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={uploadedUrl} />
      <div className="mt-2 flex items-center gap-4">
        {preview ? (
          <img // eslint-disable-line @next/next/no-img-element -- blob: URL preview
            src={preview}
            alt="Preview"
            className="w-20 h-20 rounded-lg object-contain bg-muted"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-2xl text-muted-foreground">
            {type === "logo" ? "⚽" : "📷"}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading
              ? t("imageUpload", "uploading", locale)
              : preview
                ? t("imageUpload", "change", locale)
                : t("imageUpload", "choose", locale)}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("imageUpload", type === "logo" ? "hintLogo" : "hintPhoto", locale)}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
