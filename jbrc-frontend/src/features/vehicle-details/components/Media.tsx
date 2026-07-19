import H2 from "@/components/H2";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Vehicle } from "@/features/garage/schemas/GetVehicles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { GetVehicleMediaQuery } from "../queries/GetVehicleMedia";
import {
  deleteVehicleMedia,
  uploadVehicleMedia,
} from "../queries/uploadVehicleMedia";
import VehicleMediaGallery from "./VehicleMediaGallery";
import VehicleThumbnail from "./VehicleThumbnail";

export default function Media({ vehicle }: { vehicle: Vehicle }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaQuery = GetVehicleMediaQuery(vehicle.id);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: mediaQuery.queryKey });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadVehicleMedia(vehicle.id, files),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (mediaId: string) => deleteVehicleMedia(vehicle.id, mediaId),
    onSuccess: invalidate,
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length > 0) uploadMutation.mutate(files);
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
                  {uploadMutation.isPending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              }
            />
            <TooltipContent>Upload photos or videos</TooltipContent>
          </Tooltip>
          {(uploadMutation.isError || removeMutation.isError) && (
            <p className="text-sm text-destructive">
              {uploadMutation.isError
                ? `Failed to upload media. Please try again. ${(uploadMutation.error as Error).message}`
                : "Failed to remove media. Please try again."}
            </p>
          )}
        </div>
      </div>
      <VehicleMediaGallery vehicleId={vehicle.id} />
    </div>
  );
}
