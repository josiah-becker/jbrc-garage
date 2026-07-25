import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSessionThumbnailUrl } from "@/lib/media";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, Loader2Icon, Upload, XIcon } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import {
  deleteSessionPhoto,
  uploadSessionPhoto,
} from "../queries/uploadSessionPhoto";
import type { Session } from "../schemas/GetSessions";

export default function SessionThumbnail({ session }: { session: Session }) {
  const [photoState, setPhotoState] = useState<
    "unknown" | "present" | "missing"
  >("unknown");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadSessionPhoto(session.id, file),
    onSuccess: () => {
      setPhotoState("present");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => deleteSessionPhoto(session.id),
    onSuccess: () => setPhotoState("missing"),
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadMutation.mutate(file);
  }

  return (
    <div className="relative w-fit">
      {photoState === "missing" ? (
        <div className="flex size-40 items-center justify-center rounded-xl bg-accent text-muted-foreground">
          <ImageIcon className="size-8" />
        </div>
      ) : (
        <img
          className="size-40 aspect-square object-cover bg-accent rounded-xl"
          src={getSessionThumbnailUrl(session.id)}
          onLoad={() => {
            if (photoState === "unknown") setPhotoState("present");
          }}
          onError={() => setPhotoState("missing")}
          alt={session.name}
        />
      )}
      <div className="absolute bottom-2 right-2 flex items-center gap-2 max-w-md">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
                {uploadMutation.isPending ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            }
          />
          <TooltipContent>
            {photoState === "present"
              ? "Upload a new thumbnail"
              : "Upload a thumbnail"}
          </TooltipContent>
        </Tooltip>
        {photoState === "present" && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate()}
                >
                  {removeMutation.isPending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <XIcon />
                  )}
                </Button>
              }
            />
            <TooltipContent>Remove thumbnail</TooltipContent>
          </Tooltip>
        )}
      </div>
      {(uploadMutation.isError || removeMutation.isError) && (
        <p className="mt-1 text-sm text-destructive">
          {uploadMutation.isError
            ? "Failed to upload photo. Please try again."
            : "Failed to remove photo. Please try again."}
        </p>
      )}
    </div>
  );
}
