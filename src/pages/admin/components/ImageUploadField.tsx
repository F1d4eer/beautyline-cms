import { useRef } from "react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { resolveImage } from "@/hooks/use-content";
import { Upload, X, Loader2 } from "lucide-react";
import { isSupabaseReady } from "@/lib/supabase/client";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  localFallback?: string;
  label?: string;
}

const ImageUploadField = ({
  value,
  onChange,
  localFallback = "",
  label = "Изображение",
}: ImageUploadFieldProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error } = useImageUpload();

  const src = resolveImage(value, localFallback);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    onChange(url);
    e.target.value = "";
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>

      {src && (
        <div className="group relative w-32 overflow-hidden rounded-xl border border-border/30">
          <img src={src} alt="" className="h-20 w-full object-cover" />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || !isSupabaseReady}
          className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-surface-low px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-border/30 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? "Загрузка..." : "Загрузить"}
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="или вставьте URL"
          className="h-8 flex-1 rounded-lg border border-border/40 bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {!isSupabaseReady && (
        <p className="text-[10px] text-yellow-600">Supabase не подключён — загрузка недоступна</p>
      )}
      {error && <p className="text-[10px] text-destructive">{error}</p>}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default ImageUploadField;
