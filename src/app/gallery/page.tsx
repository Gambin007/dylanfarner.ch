import Image from "next/image";
import type { Metadata } from "next";
import { slides, type Photo } from "@/data/photos";

export const metadata: Metadata = {
  title: "Dylan Farner — Gallery",
};

/** Wie stark eine Kachel beim Überfahren wächst. */
const HOVER_SCALE = 3.63;

/**
 * Setzt die Bildunterschrift an die linke untere Ecke des vergrösserten Bildes,
 * gerechnet ab der Mitte der unskalierten Zelle. Sie sitzt bewusst ausserhalb des
 * skalierten Elements, sonst würde der Text mitvergrössert.
 *
 * Das Bild steht mit object-contain in einem Quadrat und füllt es deshalb nur in
 * einer Richtung – wo seine Kanten liegen, hängt am Seitenverhältnis.
 */
function captionPosition(photo: Photo) {
  const ratio = photo.width / photo.height;
  const visibleWidth = Math.min(ratio, 1) * HOVER_SCALE;
  const visibleHeight = Math.min(1 / ratio, 1) * HOVER_SCALE;
  return {
    left: `calc(50% - ${(visibleWidth / 2) * 100}%)`,
    top: `calc(50% + ${(visibleHeight / 2) * 100}% + 0.5rem)`,
  };
}

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

  return (
    <div className="group/gallery">
      {/*
        Legt sich beim Überfahren einer Kachel über die ganze Seite – auch über die
        Navigation, die z-50 trägt. Die vergrösserte Kachel liegt mit z-70 darüber.
      */}
      <div className="pointer-events-none fixed inset-0 z-60 bg-black/70 opacity-0 transition-opacity duration-300 group-has-[figure:hover]/gallery:opacity-100" />

      {/* overflow-x-clip, weil die vergrösserten Kacheln am Rand sonst horizontal scrollen lassen. */}
      <div className="grid grid-cols-3 gap-x-10 gap-y-10 overflow-x-clip px-6 py-32 sm:grid-cols-4 sm:gap-x-20 sm:px-24 md:grid-cols-6 md:gap-x-32 md:gap-y-20 md:px-32">
        {photos.map((photo) => (
          <figure key={photo.src} className="group/tile relative aspect-square hover:z-70">
            {/* Nur das Bild wird skaliert, damit die Unterschrift ihre Grösse behält. */}
            <div className="h-full w-full transition-[scale,filter] duration-300 ease-out group-hover/tile:scale-[3.63] group-hover/tile:drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 30vw, 20vw"
                className="object-contain"
              />
            </div>

            {photo.title && (
              <figcaption
                className="pointer-events-none absolute text-left text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100"
                style={captionPosition(photo)}
              >
                {photo.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
