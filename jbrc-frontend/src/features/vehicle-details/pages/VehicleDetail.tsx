import H1 from "@/components/H1";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVehicleThumbnailUrl } from "@/lib/media";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { UploadIcon, XIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import DeleteVehicleDialog from "../../garage/components/DeleteVehicleDialog";
import { getVehicleThumbnail } from "../../garage/lib/thumbnails";
import Parts from "../components/Parts";
import { GetVehicleQuery } from "../queries/GetVehicle";
import {
  deleteVehiclePhoto,
  uploadVehiclePhoto,
} from "../queries/uploadVehiclePhoto";

export default function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const navigate = useNavigate();
  const {
    data: vehicle,
    isPending,
    isError,
  } = useQuery(GetVehicleQuery(vehicleId));

  const [photoState, setPhotoState] = useState<
    "unknown" | "present" | "missing"
  >("unknown");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadVehiclePhoto(vehicleId, file),
    onSuccess: () => {
      setPhotoState("present");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => deleteVehiclePhoto(vehicleId),
    onSuccess: () => setPhotoState("missing"),
  });

  if (isPending) return <Skeleton className="w-full h-64" />;
  if (isError) return <p>Vehicle not found.</p>;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadMutation.mutate(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <H1>{vehicle.name}</H1>
        <DeleteVehicleDialog
          vehicleId={vehicleId}
          vehicleName={vehicle.name}
          onDeleted={() => navigate({ to: "/" })}
        />
      </div>
      <p className="text-muted-foreground">
        {vehicle.brand} &middot; {vehicle.scale}
      </p>
      <Tabs>
        <TabsList variant="line" className="w-full max-w-md">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="repairs">Repairs</TabsTrigger>
        </TabsList>
        <TabsContent value="media" className="flex flex-col gap-3">
          <img
            className="w-full max-w-md aspect-square object-cover bg-accent rounded-xl"
            src={
              photoState === "missing"
                ? getVehicleThumbnail(vehicle.name)
                : `${getVehicleThumbnailUrl(vehicleId)}`
            }
            onLoad={() => {
              if (photoState === "unknown") setPhotoState("present");
            }}
            onError={() => {
              if (photoState !== "missing") setPhotoState("missing");
            }}
            alt={vehicle.name}
          />
          <div className="flex items-center gap-2 max-w-md">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              {uploadMutation.isPending
                ? "Uploading..."
                : photoState === "present"
                  ? "Change photo"
                  : "Upload photo"}
            </Button>
            {photoState === "present" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate()}
              >
                <XIcon />
                {removeMutation.isPending ? "Removing..." : "Remove"}
              </Button>
            )}
          </div>
          {(uploadMutation.isError || removeMutation.isError) && (
            <p className="text-sm text-destructive">
              {uploadMutation.isError
                ? "Failed to upload photo. Please try again."
                : "Failed to remove photo. Please try again."}
            </p>
          )}
        </TabsContent>
        <TabsContent value="details">
          <p>Details content goes here.</p>
        </TabsContent>
        <TabsContent value="parts">
          <Parts vehicleId={vehicleId} />
        </TabsContent>
        <TabsContent value="repairs">
          <p>Repairs content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
