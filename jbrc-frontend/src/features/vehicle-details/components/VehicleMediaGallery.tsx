import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getVehicleMediaUrl } from "@/lib/media";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, XIcon } from "lucide-react";
import { GetVehicleMediaQuery } from "../queries/GetVehicleMedia";
import { deleteVehicleMedia } from "../queries/uploadVehicleMedia";

export default function VehicleMediaGallery({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const queryClient = useQueryClient();

  const mediaQuery = GetVehicleMediaQuery(vehicleId);
  const { data: media, isPending, isError } = useQuery(mediaQuery);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: mediaQuery.queryKey });

  const removeMutation = useMutation({
    mutationFn: (mediaId: string) => deleteVehicleMedia(vehicleId, mediaId),
    onSuccess: invalidate,
  });

  if (isPending) return <Skeleton className="w-full h-32" />;
  if (isError)
    return <p className="text-sm text-destructive">Failed to load media.</p>;

  const galleryMedia = media.filter(
    (item) => item.content_type !== "application/pdf",
  );

  return (
    <div className="flex flex-col gap-3">
      {galleryMedia.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No media for this vehicle yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {galleryMedia.map((item) => {
            const url = getVehicleMediaUrl(vehicleId, item.id);
            const isRemoving =
              removeMutation.isPending && removeMutation.variables === item.id;
            return (
              <div key={item.id} className="relative">
                {item.content_type.startsWith("video/") ? (
                  <video
                    src={url}
                    controls
                    className="aspect-square w-full object-cover bg-accent rounded-xl"
                  />
                ) : (
                  <img
                    src={url}
                    alt={item.caption ?? ""}
                    loading="lazy"
                    className="aspect-square w-full object-cover bg-accent rounded-xl"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={removeMutation.isPending}
                          onClick={() => removeMutation.mutate(item.id)}
                        >
                          {isRemoving ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <XIcon />
                          )}
                        </Button>
                      }
                    />
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
