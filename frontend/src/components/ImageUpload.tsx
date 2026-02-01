import type { ChangeEvent } from "react";
import { FiImage, FiUploadCloud } from "react-icons/fi";

type Props = {
  label: string;
  hint?: string;
  required?: boolean;
  value: File | null;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  capture?: "user" | "environment";
  maxSizeMB?: number;
  maxDimension?: number;
  quality?: number;
  onError?: (message: string) => void;
};

async function compressImage(
  file: File,
  maxDimension: number,
  quality: number,
): Promise<File | null> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = imageUrl;
    });

    const scale = Math.min(
      1,
      maxDimension / Math.max(img.width || 1, img.height || 1),
    );
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const outputType = "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, quality),
    );
    if (!blob) return null;

    return new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function ImageUpload({
  label,
  hint,
  required,
  value,
  previewUrl,
  onChange,
  disabled,
  capture = "environment",
  maxSizeMB = 100,
  maxDimension = 2048,
  quality = 0.85,
  onError,
}: Props) {
  const url = previewUrl ?? (value ? URL.createObjectURL(value) : null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) {
      onChange(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      onError?.("Arquivo inválido. Selecione uma imagem.");
      onChange(null);
      return;
    }

    let nextFile = file;
    if (file.size > maxSizeBytes) {
      const compressed = await compressImage(file, maxDimension, quality);
      if (compressed) nextFile = compressed;
    }

    if (nextFile.size > maxSizeBytes) {
      onError?.("Imagem muito grande. Tente novamente.");
      onChange(null);
      return;
    }

    onChange(nextFile);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-800">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>

      <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
            <FiImage className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {value ? value.name : "Escolha uma imagem"}
            </p>
            <p className="text-xs text-slate-500">
              JPG, PNG ou WEBP. Máx. 5MB.
            </p>
          </div>
          <label
            className={`relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${
              disabled ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <FiUploadCloud />
            Selecionar
            <input
              type="file"
              accept="image/*"
              capture={capture}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={disabled}
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex h-48 w-full items-center justify-center bg-slate-50">
          {url ? (
            <img src={url} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="text-sm text-slate-500">Sem imagem</div>
          )}
        </div>
      </div>
    </div>
  );
}
