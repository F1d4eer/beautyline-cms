import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase/client";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Upload, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  name: string;
  url: string;
  created_at: string | null;
}

const MediaAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { upload, uploading } = useImageUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: files = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ["media_files"],
    queryFn: async () => {
      if (!isSupabaseReady) return [];
      const { data, error } = await supabase.storage.from("media").list("media", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error || !data) return [];
      return data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name,
          url: supabase.storage.from("media").getPublicUrl(`media/${f.name}`).data.publicUrl,
          created_at: f.created_at ?? null,
        }));
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload(file);
      queryClient.invalidateQueries({ queryKey: ["media_files"] });
      toast({ title: "Файл загружен" });
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    }
    e.target.value = "";
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL скопирован" });
  };

  const deleteFile = async (name: string) => {
    if (!isSupabaseReady) return;
    if (!confirm(`Удалить файл ${name}?`)) return;
    setDeleting(name);
    const { error } = await supabase.storage.from("media").remove([`media/${name}`]);
    if (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["media_files"] });
      toast({ title: "Файл удалён" });
    }
    setDeleting(null);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Медиа</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Изображения в Supabase Storage
          </p>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload size={16} className="mr-2" />
          {uploading ? "Загрузка..." : "Загрузить"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {!isSupabaseReady && (
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          Supabase не подключён. Подключите Supabase для работы с медиафайлами.
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Загрузка...</p>}

      {!isLoading && files.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/40 py-16 text-muted-foreground">
          <ImageIcon size={32} className="opacity-40" />
          <p className="text-sm">Нет загруженных файлов</p>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Загрузить первый файл
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file) => (
          <div
            key={file.name}
            className="group relative overflow-hidden rounded-xl border border-border/30 bg-card"
          >
            <div className="aspect-square w-full overflow-hidden bg-surface-low">
              <img
                src={file.url}
                alt={file.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-2">
              <p className="truncate text-xs text-muted-foreground" title={file.name}>
                {file.name}
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => copyUrl(file.url)}
                className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
                title="Копировать URL"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => deleteFile(file.name)}
                disabled={deleting === file.name}
                className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-red-500/60"
                title="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaAdmin;
