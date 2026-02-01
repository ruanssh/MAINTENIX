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
};

export function ImageUpload({
  label,
  hint,
  required,
  value,
  previewUrl,
  onChange,
  disabled,
  capture = "environment",
}: Props) {
  const url = previewUrl ?? (value ? URL.createObjectURL(value) : null);

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
              onChange={(event) =>
                onChange(event.target.files?.[0] ?? null)
              }
            />
          </label>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex h-48 w-full items-center justify-center bg-slate-50">
          {url ? (
            <img
              src={url}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-sm text-slate-500">Sem imagem</div>
          )}
        </div>
      </div>
    </div>
  );
}
