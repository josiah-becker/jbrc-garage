import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getVehicleThumbnail } from "@/features/garage/lib/thumbnails";
import type { Vehicle } from "@/features/garage/schemas/GetVehicles";
import { getVehicleThumbnailUrl } from "@/lib/media";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon, Upload, XIcon } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import {
  deleteVehiclePhoto,
  uploadVehiclePhoto,
} from "../queries/uploadVehiclePhoto";

export default function VehicleThumbnail({ vehicle }: { vehicle: Vehicle }) {
  const [photoState, setPhotoState] = useState<
    "unknown" | "present" | "missing"
  >("unknown");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadVehiclePhoto(vehicle.id, file),
    onSuccess: () => {
      setPhotoState("present");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => deleteVehiclePhoto(vehicle.id),
    onSuccess: () => setPhotoState("missing"),
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadMutation.mutate(file);
  }

  return (
    <>
      <div className="relative w-fit">
        <img
          className="size-100 aspect-square object-cover bg-accent rounded-xl"
          src={
            photoState === "missing"
              ? getVehicleThumbnail(vehicle.name)
              : `${getVehicleThumbnailUrl(vehicle.id)}`
          }
          onLoad={() => {
            if (photoState === "unknown") setPhotoState("present");
          }}
          onError={() => {
            if (photoState !== "missing") setPhotoState("missing");
          }}
          alt={vehicle.name}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 max-w-md">
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
          {(uploadMutation.isError || removeMutation.isError) && (
            <p className="text-sm text-destructive">
              {uploadMutation.isError
                ? "Failed to upload photo. Please try again."
                : "Failed to remove photo. Please try again."}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
