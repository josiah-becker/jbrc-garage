import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useRef, type KeyboardEvent, type TouchEvent } from "react";
import type { MediaItem } from "./types";

export default function MediaLightbox({
  media,
  getUrl,
  index,
  onIndexChange,
}: {
  media: MediaItem[];
  getUrl: (mediaId: string) => string;
  index: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const touchStartX = useRef<number | null>(null);

  const open = index !== null;
  const current = index !== null ? media[index] : null;
  const hasMultiple = media.length > 1;

  function goTo(next: number) {
    if (!hasMultiple) return;
    onIndexChange(((next % media.length) + media.length) % media.length);
  }

  function goPrev() {
    if (index !== null) goTo(index - 1);
  }

  function goNext() {
    if (index !== null) goTo(index + 1);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    const threshold = 50;
    if (delta > threshold) goPrev();
    else if (delta < -threshold) goNext();
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onIndexChange(null);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/95 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 flex h-dvh w-screen flex-col outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          {current && (
            <>
              <div className="flex items-center justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
                <DialogPrimitive.Title className="truncate text-sm text-white/70">
                  {hasMultiple ? `${index! + 1} / ${media.length}` : "Media"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-white hover:bg-white/10 hover:text-white"
                    />
                  }
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>

              <div
                className="relative flex flex-1 items-center justify-center overflow-hidden px-2"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {hasMultiple && (
                  <div className="absolute left-1 top-1/2 z-10 -translate-y-1/2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      className="text-white hover:bg-white/10 hover:text-white active:translate-y-0"
                      onClick={goPrev}
                    >
                      <ChevronLeftIcon className="size-6" />
                      <span className="sr-only">Previous</span>
                    </Button>
                  </div>
                )}

                {current.content_type.startsWith("video/") ? (
                  <video
                    key={current.id}
                    src={getUrl(current.id)}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full rounded-lg"
                  />
                ) : (
                  <img
                    key={current.id}
                    src={getUrl(current.id)}
                    alt={current.caption ?? ""}
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                )}

                {hasMultiple && (
                  <div className="absolute right-1 top-1/2 z-10 -translate-y-1/2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      className="text-white hover:bg-white/10 hover:text-white active:translate-y-0"
                      onClick={goNext}
                    >
                      <ChevronRightIcon className="size-6" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-white">
                {current.caption && (
                  <DialogPrimitive.Description className="text-sm">
                    {current.caption}
                  </DialogPrimitive.Description>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                  <Badge
                    variant="outline"
                    className="border-white/20 text-white/80"
                  >
                    {current.content_type}
                  </Badge>
                  <span>{formatBytes(current.size_bytes)}</span>
                  <span>
                    {new Date(current.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
