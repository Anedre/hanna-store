"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, ImagePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Campo de imagen de producto: subir archivo (→ S3, procesado a webp) o pegar URL.
 * Funciona en forms no controlados (expone input name=) y controlados (onChange).
 */
export function ImageUpload({
  name = "imageUrl",
  initialUrl = "",
  onChange,
}: {
  name?: string;
  initialUrl?: string;
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function setValue(next: string) {
    setUrl(next);
    onChange?.(next);
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Error al subir");
      } else {
        setValue(json.url);
      }
    } catch {
      setError("Error de red al subir la imagen");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          isLoading={uploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? "Subiendo…" : "Subir foto"}
        </Button>
        {url && !uploading && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> imagen lista
          </span>
        )}
      </div>

      <Input
        label="URL de la imagen"
        name={name}
        value={url}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Se llena al subir, o pega una URL"
        icon={<ImagePlus className="h-4 w-4" />}
      />

      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Vista previa"
          className="w-28 h-28 rounded-xl object-cover border border-cream-200 bg-cream-50"
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-cream-400">
        La foto se optimiza automáticamente (webp, máx 1200px) y se guarda en S3.
      </p>
    </div>
  );
}
