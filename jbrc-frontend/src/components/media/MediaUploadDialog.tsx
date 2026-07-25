import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatBytes } from "@/lib/utils";
import { FileVideoIcon, Loader2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { MediaUploadItem } from "./types";

type PendingItem = {
  file: File;
  caption: string;
  previewUrl: string | null;
};

function buildItems(files: File[]): PendingItem[] {
  return files.map((file) => ({
    file,
    caption: "",
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null,
  }));
}

export default function MediaUploadDialog({
  files,
  isUploading,
  error,
  onCancel,
  onUpload,
}: {
  files: File[];
  isUploading: boolean;
  error: string | null;
  onCancel: () => void;
  onUpload: (items: MediaUploadItem[]) => void;
}) {
  const [items, setItems] = useState<PendingItem[]>([]);

  useEffect(() => {
    const next = buildItems(files);
    setItems(next);
    return () => {
      for (const item of next) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, [files]);

  function removeAt(index: number) {
    setItems((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function setCaption(index: number, caption: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, caption } : item)),
    );
  }

  function handleSubmit() {
    if (items.length === 0) return;
    onUpload(
      items.map(({ file, caption }) => ({
        file,
        caption: caption.trim() || undefined,
      })),
    );
  }

  return (
    <Dialog
      open={files.length > 0}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Upload {items.length} {items.length === 1 ? "file" : "files"}
          </DialogTitle>
          <DialogDescription>
            Add an optional caption for each photo or video.
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileVideoIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-xs text-muted-foreground">
                  {item.file.name} · {formatBytes(item.file.size)}
                </p>
                <Input
                  placeholder="Add a caption (optional)"
                  value={item.caption}
                  onChange={(e) => setCaption(index, e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isUploading}
                onClick={() => removeAt(index)}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isUploading || items.length === 0}
            onClick={handleSubmit}
          >
            {isUploading && <Loader2Icon className="h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
