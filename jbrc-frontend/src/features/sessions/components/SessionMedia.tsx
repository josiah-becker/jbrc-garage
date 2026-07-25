import H2 from "@/components/H2";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MediaGallery from "@/components/media/MediaGallery";
import MediaUploadDialog from "@/components/media/MediaUploadDialog";
import type { MediaUploadItem } from "@/components/media/types";
import { getSessionMediaUrl } from "@/lib/media";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState, useRef, type ChangeEvent } from "react";
import { GetSessionMediaQuery } from "../queries/GetSessionMedia";
import {
  deleteSessionMedia,
  uploadSessionMedia,
} from "../queries/uploadSessionMedia";

export default function SessionMedia({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const mediaQuery = GetSessionMediaQuery(sessionId);
  const { data: media, isPending, isError } = useQuery(mediaQuery);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: mediaQuery.queryKey });

  const uploadMutation = useMutation({
    mutationFn: (items: MediaUploadItem[]) =>
      uploadSessionMedia(sessionId, items),
    onSuccess: () => {
      invalidate();
      setPendingFiles([]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (mediaId: string) => deleteSessionMedia(sessionId, mediaId),
    onSuccess: invalidate,
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length > 0) {
      uploadMutation.reset();
      setPendingFiles(files);
    }
  }

  function handleCancelUpload() {
    uploadMutation.reset();
    setPendingFiles([]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <H2>Media</H2>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  disabled={uploadMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              }
            />
            <TooltipContent>Upload photos or videos</TooltipContent>
          </Tooltip>
          {removeMutation.isError && (
            <p className="text-sm text-destructive">
              Failed to remove media. Please try again.
            </p>
          )}
        </div>
      </div>
      <MediaGallery
        media={media}
        isPending={isPending}
        isError={isError}
        getUrl={(mediaId) => getSessionMediaUrl(sessionId, mediaId)}
        onRemove={(mediaId) => removeMutation.mutate(mediaId)}
        isRemoving={(mediaId) =>
          removeMutation.isPending && removeMutation.variables === mediaId
        }
        emptyLabel="No media for this session yet."
      />
      <MediaUploadDialog
        files={pendingFiles}
        isUploading={uploadMutation.isPending}
        error={
          uploadMutation.isError
            ? `Failed to upload media. Please try again. ${(uploadMutation.error as Error).message}`
            : null
        }
        onCancel={handleCancelUpload}
        onUpload={(items) => uploadMutation.mutate(items)}
      />
    </div>
  );
}
