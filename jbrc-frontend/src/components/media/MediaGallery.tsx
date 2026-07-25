import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2Icon, PlayIcon, XIcon } from "lucide-react";
import { useState } from "react";
import MediaLightbox from "./MediaLightbox";
import type { MediaItem } from "./types";

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

function groupByDay(items: MediaItem[]) {
  const groups: {
    key: string;
    label: string;
    items: { item: MediaItem; index: number }[];
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

export default function MediaGallery({
  media,
  isPending,
  isError,
  getUrl,
  onRemove,
  isRemoving,
  emptyLabel = "No media yet.",
}: {
  media: MediaItem[] | undefined;
  isPending: boolean;
  isError: boolean;
  getUrl: (mediaId: string) => string;
  onRemove: (mediaId: string) => void;
  isRemoving: (mediaId: string) => boolean;
  emptyLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isPending) return <Skeleton className="w-full h-32" />;
  if (isError)
    return <p className="text-sm text-destructive">Failed to load media.</p>;

  const sortedMedia = [...(media ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const groups = groupByDay(sortedMedia);

  return (
    <div className="flex flex-col gap-3">
      {sortedMedia.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {group.label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {group.items.map(({ item, index }) => {
                  const url = getUrl(item.id);
                  const isVideo = item.content_type.startsWith("video/");
                  const removing = isRemoving(item.id);
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
                                disabled={removing}
                                onClick={() => onRemove(item.id)}
                              >
                                {removing ? (
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
        media={sortedMedia}
        getUrl={getUrl}
        index={activeIndex}
        onIndexChange={setActiveIndex}
      />
    </div>
  );
}
