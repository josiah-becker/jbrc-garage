const thumbnails = import.meta.glob<string>("/src/assets/thumbnails/*.jpeg", {
  eager: true,
  import: "default",
});

export function getVehicleThumbnail(name: string) {
  return thumbnails[`/src/assets/thumbnails/${name.toLowerCase()}_thumbnail.jpeg`];
}
