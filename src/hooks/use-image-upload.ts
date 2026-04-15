import { useState } from "react";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string> => {
    if (!isSupabaseReady) throw new Error("Supabase не настроен");

    setUploading(true);
    setError(null);

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      // Путь — только имя файла, БЕЗ префикса media/ (бакет уже называется "media")
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, {
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        // Даём понятные сообщения
        if (/bucket.*not.*found/i.test(uploadError.message)) {
          throw new Error("Бакет 'media' не создан в Supabase Storage. Запустите fix-missing.sql.");
        }
        if (/(permission|policy|unauthorized|rls)/i.test(uploadError.message)) {
          throw new Error("Нет прав на загрузку. Проверьте политики Storage для бакета 'media'.");
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки";
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
