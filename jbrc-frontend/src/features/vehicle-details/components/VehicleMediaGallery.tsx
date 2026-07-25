import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getVehicleMediaUrl } from "@/lib/media";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PlayIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { GetVehicleMediaQuery } from "../queries/GetVehicleMedia";
import type { VehicleMediaList } from "../schemas/GetVehicleMedia";
import { deleteVehicleMedia } from "../queries/uploadVehicleMedia";
import MediaLightbox from "./MediaLightbox";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDayLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByDay(items: VehicleMediaList) {
  const groups: {
    key: string;
    label: string;
    items: { item: VehicleMediaList[number]; index: number }[];
  }[] = [];
  const groupIndexByKey = new Map<string, number>();

  items.forEach((item, index) => {
    const date = new Date(item.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    let groupIndex = groupIndexByKey.get(key);
    if (groupIndex === undefined) {
      groupIndex = groups.length;
      groupIndexByKey.set(key, groupIndex);
      groups.push({ key, label: getDayLabel(date), items: [] });
    }
    groups[groupIndex].items.push({ item, index });
  });

  return groups;
}

export default function VehicleMediaGallery({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const queryClient = useQueryClient();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  const sortedMedia = [...galleryMedia].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const groups = groupByDay(sortedMedia);

  return (
    <div className="flex flex-col gap-3">
      {sortedMedia.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No media for this vehicle yet.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {group.label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {group.items.map(({ item, index }) => {
                  const url = getVehicleMediaUrl(vehicleId, item.id);
                  const isVideo = item.content_type.startsWith("video/");
                  const isRemoving =
                    removeMutation.isPending &&
                    removeMutation.variables === item.id;
                  return (
                    <div key={item.id} className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={
                          item.caption
                            ? `View ${isVideo ? "video" : "photo"}: ${item.caption}`
                            : `View ${isVideo ? "video" : "photo"}`
                        }
                        className="block w-full overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {isVideo ? (
                          <video
                            src={url}
                            muted
                            playsInline
                            preload="metadata"
                            className="pointer-events-none aspect-square w-full object-cover bg-accent"
                          />
                        ) : (
                          <img
                            src={url}
                            alt={item.caption ?? ""}
                            loading="lazy"
                            className="aspect-square w-full object-cover bg-accent"
                          />
                        )}
                      </button>
                      {isVideo && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/50 p-2">
                            <PlayIcon className="size-5 fill-white text-white" />
                          </div>
                        </div>
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
            </div>
          ))}
        </div>
      )}
      <MediaLightbox
        vehicleId={vehicleId}
        media={sortedMedia}
        index={activeIndex}
        onIndexChange={setActiveIndex}
      />
    </div>
  );
}
