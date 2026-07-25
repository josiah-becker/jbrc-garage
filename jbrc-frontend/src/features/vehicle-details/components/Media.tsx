import H2 from "@/components/H2";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Vehicle } from "@/features/garage/schemas/GetVehicles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState, useRef, type ChangeEvent } from "react";
import { GetVehicleMediaQuery } from "../queries/GetVehicleMedia";
import {
  deleteVehicleMedia,
  uploadVehicleMedia,
  type MediaUploadItem,
} from "../queries/uploadVehicleMedia";
import MediaUploadDialog from "./MediaUploadDialog";
import VehicleMediaGallery from "./VehicleMediaGallery";
import VehicleThumbnail from "./VehicleThumbnail";

export default function Media({ vehicle }: { vehicle: Vehicle }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const mediaQuery = GetVehicleMediaQuery(vehicle.id);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: mediaQuery.queryKey });

  const uploadMutation = useMutation({
    mutationFn: (items: MediaUploadItem[]) =>
      uploadVehicleMedia(vehicle.id, items),
    onSuccess: () => {
      invalidate();
      setPendingFiles([]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (mediaId: string) => deleteVehicleMedia(vehicle.id, mediaId),
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
      <H2>Thumbnail</H2>
      <VehicleThumbnail vehicle={vehicle} />
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
      <VehicleMediaGallery vehicleId={vehicle.id} />
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
