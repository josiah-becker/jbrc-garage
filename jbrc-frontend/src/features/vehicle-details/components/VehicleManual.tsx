import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getVehicleMediaUrl } from "@/lib/media";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon, Loader2Icon, Upload, XIcon } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { GetVehicleMediaQuery } from "../queries/GetVehicleMedia";
import { uploadVehicleManual } from "../queries/uploadVehicleManual";
import { deleteVehicleMedia } from "../queries/uploadVehicleMedia";

export default function VehicleManual({ vehicleId }: { vehicleId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaQuery = GetVehicleMediaQuery(vehicleId);
  const { data: media, isPending, isError } = useQuery(mediaQuery);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: mediaQuery.queryKey });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadVehicleManual(vehicleId, file),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (mediaId: string) => deleteVehicleMedia(vehicleId, mediaId),
    onSuccess: invalidate,
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadMutation.mutate(file);
  }

  if (isPending) return <Skeleton className="w-full h-32" />;
  if (isError)
    return <p className="text-sm text-destructive">Failed to load manual.</p>;

  const manual = media.find((item) => item.content_type === "application/pdf");
  const manualUrl = manual && getVehicleMediaUrl(vehicleId, manual.id);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
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
            {manual ? "Replace the manual" : "Upload a PDF manual"}
          </TooltipContent>
        </Tooltip>
        {manual && (
          <>
            <Button
              variant="outline"
              size="sm"
              render={<a href={manualUrl} target="_blank" rel="noreferrer" />}
            >
              <ExternalLinkIcon />
              Open in new tab
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(manual.id)}
                  >
                    {removeMutation.isPending ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <XIcon />
                    )}
                  </Button>
                }
              />
              <TooltipContent>Remove manual</TooltipContent>
            </Tooltip>
          </>
        )}
        {(uploadMutation.isError || removeMutation.isError) && (
          <p className="text-sm text-destructive">
            {uploadMutation.isError
              ? "Failed to upload manual. Please try again."
              : "Failed to remove manual. Please try again."}
          </p>
        )}
      </div>
      {manual ? (
        <>
          {manual.caption && (
            <p className="text-sm text-muted-foreground">{manual.caption}</p>
          )}
          <object
            data={manualUrl}
            type="application/pdf"
            className="w-full h-[70vh] rounded-xl border bg-accent"
          >
            <p className="p-4 text-sm text-muted-foreground">
              Your browser can't display PDFs inline.{" "}
              <a
                href={manualUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Open the manual in a new tab
              </a>{" "}
              instead.
            </p>
          </object>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No manual for this vehicle yet.
        </p>
      )}
    </div>
  );
}
