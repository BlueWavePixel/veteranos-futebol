"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

type ImageUploadProps = {
  name: string;
  label: string;
  currentUrl?: string | null;
  type: "logo" | "photo";
};

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
        alert(data.error || "Erro ao enviar imagem");
        setPreview(currentUrl || null);
      }
    } catch {
      alert("Erro ao enviar imagem");
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
          <img
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
            {uploading ? "A enviar..." : preview ? "Alterar" : "Escolher imagem"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP, GIF ou SVG (máx. 5MB).
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
