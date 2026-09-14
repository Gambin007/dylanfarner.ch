import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { slides } from "@/data/photos";

export const metadata: Metadata = {
  title: "Dylan Farner — Gallery",
};

export default function GalleryPage() {
  // Im Raster steht jedes Bild für sich. Die Gruppen aus photo-groups.json bleiben
  // trotzdem beieinander, weil sie in der Reihenfolge direkt aufeinander folgen.
  const photos = slides.flat();

  if (photos.length === 0) {
    return (
      <div className="px-6 py-10 text-sm italic">
        Noch keine Fotos – Bilder in public/photos/ legen und `npm run photos` laufen lassen.
      </div>
    );
  }

  return <GalleryGrid photos={photos} />;
}
